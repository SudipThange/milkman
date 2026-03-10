const API_BASE = "http://127.0.0.1:8000";

function isFormData(payload) {
    return typeof FormData !== "undefined" && payload instanceof FormData;
}

export async function loginAdmin(payload) {
    const response = await fetch(`${API_BASE}/user/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Login failed");
    }

    return data;
}

export async function fetchResource(path, token) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => []);
    if (!response.ok) {
        throw new Error(data.detail || "Failed to load records");
    }

    return Array.isArray(data) ? data : [data];
}

export async function updateResource(path, id, token, payload) {
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    if (!isFormData(payload)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}${id}/`, {
        method: "PUT",
        headers,
        body: isFormData(payload) ? payload : JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data) || "Update failed");
    }

    return data;
}

export async function createResource(path, token, payload) {
    const headers = {
        Authorization: `Bearer ${token}`,
    };

    if (!isFormData(payload)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers,
        body: isFormData(payload) ? payload : JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || JSON.stringify(data) || "Create failed");
    }

    return data;
}

export async function deleteResource(path, id, token) {
    const response = await fetch(`${API_BASE}${path}${id}/`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Delete failed");
    }
}