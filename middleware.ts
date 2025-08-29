import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    publicRoutes: [
        "/",
        "/pricing",
        "/enterprise",
        "/api/webhooks/(.*)"
    ],
    ignoredRoutes: [
        "/api/ai/(.*)"
    ]
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
