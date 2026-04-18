// Central icon registry — add new icons here as needed
import {
  FiCode, FiTool, FiCpu, FiBox, FiPenTool, FiSmartphone,
  FiFileText, FiGrid, FiMonitor, FiLayers,
} from "react-icons/fi";
import {
  SiPython, SiJavascript, SiTypescript, SiCplusplus,
  SiGit, SiGithub, SiNodedotjs, SiLinux, SiFigma,
  SiAdobephotoshop, SiBlender, SiAdobepremierepro, SiArduino,
} from "react-icons/si";
import { FaJava, FaDatabase, FaMicrochip } from "react-icons/fa";

const ICON_REGISTRY = {
  // React-icons/fi
  FiCode, FiTool, FiCpu, FiBox, FiPenTool, FiSmartphone,
  FiFileText, FiGrid, FiMonitor, FiLayers,
  // React-icons/si
  SiPython, SiJavascript, SiTypescript, SiCplusplus,
  SiGit, SiGithub, SiNodedotjs, SiLinux, SiFigma,
  SiAdobephotoshop, SiBlender, SiAdobepremierepro, SiArduino,
  // React-icons/fa
  FaJava, FaDatabase, FaMicrochip,
};

export function getIcon(key) {
  return ICON_REGISTRY[key] || FiCode;
}

export default ICON_REGISTRY;
