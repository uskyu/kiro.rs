//! Admin API HTTP 处理器

use axum::{
    Json,
    extract::{Path, State},
    response::IntoResponse,
};

use super::{
    middleware::AdminState,
    types::{
        AddCredentialRequest, SetCacheSimulationRequest, SetDisabledRequest,
        SetLoadBalancingModeRequest, SetModelSystemPromptsRequest, SetPriorityRequest,
        SetSystemPromptRequest, SuccessResponse,
    },
};

/// GET /api/admin/credentials
/// 获取所有凭据状态
pub async fn get_all_credentials(State(state): State<AdminState>) -> impl IntoResponse {
    let response = state.service.get_all_credentials();
    Json(response)
}

/// POST /api/admin/credentials/:id/disabled
/// 设置凭据禁用状态
pub async fn set_credential_disabled(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
    Json(payload): Json<SetDisabledRequest>,
) -> impl IntoResponse {
    match state.service.set_disabled(id, payload.disabled) {
        Ok(_) => {
            let action = if payload.disabled { "禁用" } else { "启用" };
            Json(SuccessResponse::new(format!("凭据 #{} 已{}", id, action))).into_response()
        }
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials/:id/priority
/// 设置凭据优先级
pub async fn set_credential_priority(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
    Json(payload): Json<SetPriorityRequest>,
) -> impl IntoResponse {
    match state.service.set_priority(id, payload.priority) {
        Ok(_) => Json(SuccessResponse::new(format!(
            "凭据 #{} 优先级已设置为 {}",
            id, payload.priority
        )))
        .into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials/:id/reset
/// 重置失败计数并重新启用
pub async fn reset_failure_count(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.service.reset_and_enable(id) {
        Ok(_) => Json(SuccessResponse::new(format!(
            "凭据 #{} 失败计数已重置并重新启用",
            id
        )))
        .into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/credentials/:id/balance
/// 获取指定凭据的余额
pub async fn get_credential_balance(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.service.get_balance(id).await {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials
/// 添加新凭据
pub async fn add_credential(
    State(state): State<AdminState>,
    Json(payload): Json<AddCredentialRequest>,
) -> impl IntoResponse {
    match state.service.add_credential(payload).await {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// DELETE /api/admin/credentials/:id
/// 删除凭据
pub async fn delete_credential(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.service.delete_credential(id) {
        Ok(_) => Json(SuccessResponse::new(format!("凭据 #{} 已删除", id))).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// POST /api/admin/credentials/:id/refresh
/// 强制刷新凭据 Token
pub async fn force_refresh_token(
    State(state): State<AdminState>,
    Path(id): Path<u64>,
) -> impl IntoResponse {
    match state.service.force_refresh_token(id).await {
        Ok(_) => Json(SuccessResponse::new(format!(
            "凭据 #{} Token 已强制刷新",
            id
        )))
        .into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/config/load-balancing
/// 获取负载均衡模式
pub async fn get_load_balancing_mode(State(state): State<AdminState>) -> impl IntoResponse {
    let response = state.service.get_load_balancing_mode();
    Json(response)
}

/// PUT /api/admin/config/load-balancing
/// 设置负载均衡模式
pub async fn set_load_balancing_mode(
    State(state): State<AdminState>,
    Json(payload): Json<SetLoadBalancingModeRequest>,
) -> impl IntoResponse {
    match state.service.set_load_balancing_mode(payload) {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/config/system-prompt
/// 获取全局默认系统提示词
pub async fn get_system_prompt(State(state): State<AdminState>) -> impl IntoResponse {
    let response = state.service.get_system_prompt();
    Json(response)
}

/// PUT /api/admin/config/system-prompt
/// 设置全局默认系统提示词
pub async fn set_system_prompt(
    State(state): State<AdminState>,
    Json(payload): Json<SetSystemPromptRequest>,
) -> impl IntoResponse {
    match state.service.set_system_prompt(payload) {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/config/model-system-prompts
/// 获取模型级系统提示词映射
pub async fn get_model_system_prompts(State(state): State<AdminState>) -> impl IntoResponse {
    let response = state.service.get_model_system_prompts();
    Json(response)
}

/// PUT /api/admin/config/model-system-prompts
/// 设置模型级系统提示词映射
pub async fn set_model_system_prompts(
    State(state): State<AdminState>,
    Json(payload): Json<SetModelSystemPromptsRequest>,
) -> impl IntoResponse {
    match state.service.set_model_system_prompts(payload) {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/config/cache-simulation
/// 获取缓存模拟配置
pub async fn get_cache_simulation(State(state): State<AdminState>) -> impl IntoResponse {
    let response = state.service.get_cache_simulation();
    Json(response)
}

/// PUT /api/admin/config/cache-simulation
/// 设置缓存模拟配置
pub async fn set_cache_simulation(
    State(state): State<AdminState>,
    Json(payload): Json<SetCacheSimulationRequest>,
) -> impl IntoResponse {
    match state.service.set_cache_simulation(payload) {
        Ok(response) => Json(response).into_response(),
        Err(e) => (e.status_code(), Json(e.into_response())).into_response(),
    }
}

/// GET /api/admin/stats
/// 获取实时并发统计
pub async fn get_stats(State(state): State<AdminState>) -> impl IntoResponse {
    let response = serde_json::json!({
        "active_requests": state.concurrency.current(),
        "total_requests": state.concurrency.total_requests(),
    });
    Json(response)
}

/// GET /api/admin/config/freeze
/// 获取冷冻配置
pub async fn get_freeze_config(State(state): State<AdminState>) -> impl IntoResponse {
    let config = state.freeze_config.read().clone();
    Json(config)
}

/// PUT /api/admin/config/freeze
/// 设置冷冻配置
pub async fn set_freeze_config(
    State(state): State<AdminState>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    // 解析并更新冷冻配置
    let mut config = state.freeze_config.write();
    if let Some(v) = payload.get("tooManyFailures") {
        if let (Some(base), Some(max)) = (v.get("baseSecs").and_then(|x| x.as_u64()), v.get("maxSecs").and_then(|x| x.as_u64())) {
            config["tooManyFailures"]["baseSecs"] = serde_json::json!(base);
            config["tooManyFailures"]["maxSecs"] = serde_json::json!(max);
        }
    }
    if let Some(v) = payload.get("tooManyRefreshFailures") {
        if let (Some(base), Some(max)) = (v.get("baseSecs").and_then(|x| x.as_u64()), v.get("maxSecs").and_then(|x| x.as_u64())) {
            config["tooManyRefreshFailures"]["baseSecs"] = serde_json::json!(base);
            config["tooManyRefreshFailures"]["maxSecs"] = serde_json::json!(max);
        }
    }
    if let Some(v) = payload.get("quotaExceeded") {
        if let (Some(base), Some(max)) = (v.get("baseSecs").and_then(|x| x.as_u64()), v.get("maxSecs").and_then(|x| x.as_u64())) {
            config["quotaExceeded"]["baseSecs"] = serde_json::json!(base);
            config["quotaExceeded"]["maxSecs"] = serde_json::json!(max);
        }
    }
    if let Some(v) = payload.get("invalidRefreshToken") {
        if let (Some(base), Some(max)) = (v.get("baseSecs").and_then(|x| x.as_u64()), v.get("maxSecs").and_then(|x| x.as_u64())) {
            config["invalidRefreshToken"]["baseSecs"] = serde_json::json!(base);
            config["invalidRefreshToken"]["maxSecs"] = serde_json::json!(max);
        }
    }
    if let Some(v) = payload.get("maxWaitForThawSecs").and_then(|x| x.as_u64()) {
        config["maxWaitForThawSecs"] = serde_json::json!(v);
    }
    let result = config.clone();
    drop(config);
    Json(result)
}
