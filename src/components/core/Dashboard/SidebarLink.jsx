import { VscAccount, VscDashboard, VscVm, VscAdd, VscMortarBoard, VscBookmark, VscHistory, VscCircle, VscSettingsGear } from "react-icons/vsc";
import { TiShoppingCart } from "react-icons/ti";
import { FaRobot } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { NavLink, matchPath, useLocation } from "react-router-dom";

export default function SidebarLink({ link, iconName }) {
  // Map icon names to actual icon components
  const iconMap = {
    VscAccount,
    VscDashboard,
    VscVm,
    VscAdd,
    VscMortarBoard,
    VscBookmark,
    VscHistory,
    VscSettingsGear,
    TiShoppingCart,
    FaRobot
  };
  
  // Get the icon component, with fallback to VscCircle if icon doesn't exist
  const Icon = iconMap[iconName] ;
  const location = useLocation();
  const dispatch = useDispatch();

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <NavLink
      to={link.path}
      className={`relative px-8 py-2 text-sm font-medium ${
        matchRoute(link.path)
          ? "bg-yellow-800 text-yellow-50"
          : "bg-opacity-0 text-richblack-300"
      } transition-all duration-200`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          matchRoute(link.path) ? "opacity-100" : "opacity-0"
        }`}
      ></span>

      <div className="flex items-center gap-x-2">
        {/* Icon with fallback */}
        <Icon className="text-lg" />
        <span>{link.name}</span>
      </div>
    </NavLink>
  ); 
}
