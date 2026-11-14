const candidate = import.meta.env.VITE_BOOKING_URL?.trim() ?? ''

export const bookingUrl = (() => {
  if (!candidate) return null
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
})()
