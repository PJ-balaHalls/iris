// web/src/components/skeletons/page-skeleton.tsx
import { HeroSkeleton } from "@/components/skeletons/hero-skeleton";
import { LoginSkeleton } from "@/components/skeletons/login-skeleton";
import { RegisterSkeleton } from "@/components/skeletons/register-skeleton";

type PageSkeletonProps = {
  pathname?: string;
};

export function PageSkeleton({ pathname = "/" }: PageSkeletonProps) {
  if (pathname.startsWith("/login")) {
    return <LoginSkeleton />;
  }

  if (pathname.startsWith("/register")) {
    return <RegisterSkeleton />;
  }

  return <HeroSkeleton />;
}
