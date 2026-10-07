const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

export function getRoles() {
  return request('/roles')
}

export function getSkills() {
  return request('/skills')
}

export function analyze({ role, skills }) {
  return request('/analyze', {
    method: 'POST',
    body: JSON.stringify({ role, skills }),
  })
}

export function getCourses(skillId) {
  return request(`/courses/${skillId}`)
}
