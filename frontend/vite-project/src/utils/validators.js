export const isMobile = (val) => /^\d{10}$/.test(val)

export const isEmail = (val) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val)

export const isPassword = (val) => val && val.length >= 6

export const isPositiveAmount = (val) => parseFloat(val) > 0