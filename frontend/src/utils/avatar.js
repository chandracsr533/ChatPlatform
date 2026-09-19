// Vibrant gradients for distinct user identities
const GRADIENTS = [
    "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", // Indigo -> Purple
    "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", // Blue -> Cyan
    "linear-gradient(135deg, #10b981 0%, #059669 100%)", // Emerald -> Green
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // Amber -> Orange
    "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", // Pink -> Rose
    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Violet
    "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", // Orange -> Deep Orange
    "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)", // Sky -> Blue
    "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)", // Teal
    "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", // Rose
    "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", // Light Blue
    "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)", // Purple -> Indigo
];

/**
 * Deterministically generates a consistent gradient based on the username.
 * Ensures each user has their own unique visual identity.
 */
export const getAvatarGradient = (username = "") => {
    const cleanName = (username || "").trim();
    if (!cleanName) return GRADIENTS[0];

    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
        hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
};

/**
 * Returns uppercase initial(s) for a given name/username.
 */
export const getInitials = (name = "") => {
    const trimmed = (name || "").trim();
    if (!trimmed) return "U";
    return trimmed.charAt(0).toUpperCase();
};

