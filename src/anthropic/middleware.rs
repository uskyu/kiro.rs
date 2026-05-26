//! Anthropic API 中间件

use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};

use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Json, Response},
};

use crate::common::auth;
use crate::kiro::provider::KiroProvider;

use super::types::ErrorResponse;

/// 全局并发请求计数器
///
/// 追踪当前正在处理的 /v1/messages 请求数量
#[derive(Clone, Default)]
pub struct ConcurrencyCounter {
    inner: Arc<AtomicU64>,
    /// 历史总请求数
    total: Arc<AtomicU64>,
}

impl ConcurrencyCounter {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(AtomicU64::new(0)),
            total: Arc::new(AtomicU64::new(0)),
        }
    }

    /// 进入请求，返回一个 guard，drop 时自动减少计数
    pub fn enter(&self) -> ConcurrencyGuard {
        self.inner.fetch_add(1, Ordering::Relaxed);
        self.total.fetch_add(1, Ordering::Relaxed);
        ConcurrencyGuard {
            counter: self.inner.clone(),
        }
    }

    /// 获取当前并发数
    pub fn current(&self) -> u64 {
        self.inner.load(Ordering::Relaxed)
    }

    /// 获取历史总请求数
    pub fn total_requests(&self) -> u64 {
        self.total.load(Ordering::Relaxed)
    }
}

/// RAII guard，drop 时自动减少并发计数
pub struct ConcurrencyGuard {
    counter: Arc<AtomicU64>,
}

impl Drop for ConcurrencyGuard {
    fn drop(&mut self) {
        self.counter.fetch_sub(1, Ordering::Relaxed);
    }
}

/// 应用共享状态
#[derive(Clone)]
pub struct AppState {
    /// API 密钥
    pub api_key: String,
    /// Kiro Provider（可选，用于实际 API 调用）
    /// 内部使用 MultiTokenManager，已支持线程安全的多凭据管理
    pub kiro_provider: Option<Arc<KiroProvider>>,
    /// 是否开启非流式响应的 thinking 块提取
    pub extract_thinking: bool,
    /// 并发请求计数器
    pub concurrency: ConcurrencyCounter,
}

impl AppState {
    /// 创建新的应用状态
    pub fn new(api_key: impl Into<String>, extract_thinking: bool) -> Self {
        Self {
            api_key: api_key.into(),
            kiro_provider: None,
            extract_thinking,
            concurrency: ConcurrencyCounter::new(),
        }
    }

    /// 设置 KiroProvider
    pub fn with_kiro_provider(mut self, provider: KiroProvider) -> Self {
        self.kiro_provider = Some(Arc::new(provider));
        self
    }

    /// 设置并发计数器（用于与 Admin API 共享）
    pub fn with_concurrency(mut self, concurrency: ConcurrencyCounter) -> Self {
        self.concurrency = concurrency;
        self
    }
}

/// API Key 认证中间件
pub async fn auth_middleware(
    State(state): State<AppState>,
    request: Request<Body>,
    next: Next,
) -> Response {
    match auth::extract_api_key(&request) {
        Some(key) if auth::constant_time_eq(&key, &state.api_key) => next.run(request).await,
        _ => {
            let error = ErrorResponse::authentication_error();
            (StatusCode::UNAUTHORIZED, Json(error)).into_response()
        }
    }
}

/// CORS 中间件层
///
/// **安全说明**：当前配置允许所有来源（Any），这是为了支持公开 API 服务。
/// 如果需要更严格的安全控制，请根据实际需求配置具体的允许来源、方法和头信息。
///
/// # 配置说明
/// - `allow_origin(Any)`: 允许任何来源的请求
/// - `allow_methods(Any)`: 允许任何 HTTP 方法
/// - `allow_headers(Any)`: 允许任何请求头
pub fn cors_layer() -> tower_http::cors::CorsLayer {
    use tower_http::cors::{Any, CorsLayer};

    CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any)
}
