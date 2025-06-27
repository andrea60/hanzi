import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { TRoutes } from "../routes/__root";
import { ComponentType, useMemo } from "react";
import cn from "classnames";

type NavLink = {
  icon: ComponentType;
  label: string;
} & (RoutingNavLink | ButtonNavLink);

type RoutingNavLink = {
  to: TRoutes;
};

type ButtonNavLink = {
  onClick: () => void;
};

type Props = {
  links: NavLink[];
};
export const NavigationBar = ({ links }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavLinkClick = (link: NavLink) => {
    if ("to" in link) {
      navigate({ to: link.to });
    } else {
      link.onClick();
    }
  };

  const linkElements = useMemo(
    () =>
      links.map((link) => {
        const Icon = link.icon;
        return (
          <div
            role="navigation"
            className={cn("flex flex-col content-center items-center")}
            onClick={() => handleNavLinkClick(link)}
          >
            <div
              className={cn("size-10 p-2 btn btn-default shadow-lg", {
                "btn-neutral": "to" in link && location.pathname === link.to,
              })}
            >
              <Icon />
            </div>
            <label className="text-xs mt-1">{link.label}</label>
          </div>
        );
      }),
    [links, location.pathname]
  );

  return <nav className="p-2 w-full flex justify-around">{linkElements}</nav>;
};
