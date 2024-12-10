import { FunctionComponent, HTMLAttributes, type SVGProps } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { AvatarMenu, MenuList, ModeToggle } from "@/components/home/navigation";
import { Css3, File, Globe, Gobang, Graphql, Photos, Pokeball, Form } from "@/components/svgs";

export interface NavigationPage {
  path: string;
  label: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  description?: string;
  children?: NavigationPage[];
}

const PAGES: NavigationPage[] = [
  { path: "/pokemon", label: "Pokémon", Icon: Pokeball },
  { path: "/photos", label: "Photos", Icon: Photos },
  { path: "/gobang", label: "Gobang", Icon: Gobang },
  {
    path: "/features",
    label: "Features",
    Icon: Globe,
    children: [
      {
        path: "/features/counter",
        label: "Counter",
        description: "A small example of Redux",
        Icon: File,
      },
      {
        path: "/features/react-form",
        label: "React hook form",
        description: "A small example of react hook form",
        Icon: Form,
      },
      {
        path: "/features/graphql",
        label: "Graphql",
        description: "A test case for graphql",
        Icon: Graphql,
      },
      {
        path: "/features/animations",
        label: "Animations",
        description: "A test case for animations",
        Icon: Css3,
      },
    ],
  },
];

export function Navigation(props: HTMLAttributes<HTMLElement>) {
  const { className } = props;

  return (
    <header className="sticky top-0 z-50 min-w-[1200px] border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <nav className={cn("page-content flex items-center gap-4 px-3", className)} {...props}>
        <Link className="text-2xl font-extrabold" href="/">
          Mewtwochips
        </Link>

        <div className="mx-6 flex flex-1 items-center">
          <NavigationMenu>
            <NavigationMenuList>
              {PAGES.map((page) => {
                const Icon = page.Icon;
                return (
                  <NavigationMenuItem key={`nav-${page.path}`} value={page.path}>
                    {page.children?.length ? (
                      <>
                        <NavigationMenuTrigger className="gap-1">
                          <Icon fill="currentColor" /> {page.label}
                        </NavigationMenuTrigger>

                        <NavigationMenuContent>
                          <MenuList pages={page} />
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link href={page.path} legacyBehavior passHref>
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "gap-1")}>
                          <Icon fill="currentColor" /> {page.label}
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>

            <NavigationMenuIndicator>
              <div className="relative top-[60%] size-2.5 rotate-45 rounded-tl-sm bg-white" />
            </NavigationMenuIndicator>

            <NavigationMenuViewport className="shadow-blue-500/50" />
          </NavigationMenu>
        </div>

        <AvatarMenu />

        <ModeToggle />
      </nav>
    </header>
  );
}
