import api from "./client";

/**
 * Exchanges a verified Supabase access token for an Ascend backend JWT.
 * Calls Spring Boot's /api/auth/register-oauth with Bearer token.
 */
export async function exchangeOAuthToken(supabaseAccessToken) {
  const response = await api.post(
    "/auth/register-oauth",
    {},
    {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    }
  );
  return response.data; // { token: string, user: UserResponse }
}

/**
 * Fetches the currently authenticated user's profile and streak information.
 */
export async function getMe() {
  const response = await api.get("/users/me");
  return response.data;
}

/**
 * Updates profile details (name, bio, timezone).
 */
export async function updateProfile(payload) {
  const response = await api.patch("/users/me", payload);
  return response.data;
}
