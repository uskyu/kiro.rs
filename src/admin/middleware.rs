//! Admin API 中间件

use std::sync::Arc;

use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Json, Response},
};
use parking_lot::RwLock;

use super::service::AdminService;
use super::types::AdminErrorResponse;
use crate::anthropic::ConcurrencyCounter;
use crate::common::auth;

/// Admin API 共享状态
#[derive(Clone)]
pub struct AdminState {
    /// Admin API 密钥
    pub admin_api_key: String,
    /// Admin 服务
    pub service: Arc<AdminService>,
    /// 并发请求计数器（与 Anthropic API 共享）
    pub concurrency: ConcurrencyCounter,
    /// 冷冻配置（运行时可修改）
    pub freeze_config: Arc<RwLock<serde_json::Value>>,
}

impl AdminState {
    pub fn new(admin_api_key: impl Into<String>, service: AdminService, concurrency: ConcurrencyCounter) -> Self {
        let default_freeze_config = serde_json::json!({
            "tooManyFailures": { "baseSecs": 30, "maxSecs": 300 },
            "tooManyRefreshFailures": { "baseSecs": 60, "maxSecs": 600 },
            "quotaExceeded": { "baseSecs": 300, "maxSecs": 3600 },
            "invalidRefreshToken": { "baseSecs": 120, "maxSecs": 1800 },
            "maxWaitForThawSecs": 30
        });
        Self {
            admin_api_key: admin_api_key.into(),
            service: Arc::new(service),
            concurrency,
            freeze_config: Arc::new(RwLock::new(default_freeze_config)),
        }
    }
}

/// Admin API 认证中间件
pub async fn admin_auth_middleware(
    State(state): State<AdminState>,
    request: Request<Body>,
    next: Next,
) -> Response {
    let api_key = auth::extract_api_key(&request);

    match api_key {
        Some(key) if auth::constant_time_eq(&key, &state.admin_api_key) => next.run(request).await,
        _ => {
            let error = AdminErrorResponse::authentication_error();
            (StatusCode::UNAUTHORIZED, Json(error)).into_response()
        }
    }
}
