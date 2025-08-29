import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    publicRoutes: [
        "/",
        "/pricing",
        "/enterprise",
        "/sign-in(.*)",
        "/sign-up(.*)"
    ],
    // Не игнорируем API routes - они должны проходить через auth
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
