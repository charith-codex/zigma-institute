import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import Menu from "./menu";

const Header = () => {
  return (
    <header className="w-full bg-linear-to-b from-blue-500/20 via-purple-500/20 to-transparent dark:from-blue-600/30 dark:via-purple-500/30 dark:to-transparent backdrop-blur-lg z-50">
      <div className="wrapper py-3 flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              src="/logo.png"
              alt={`${APP_NAME} logo`}
              height={30}
              width={30}
              priority={true}
            />
            <span className="hidden lg:block font-bold text-xl ml-3 text-gray-900 dark:text-white drop-shadow-lg">
              {APP_NAME}
            </span>
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
