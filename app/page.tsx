"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "antd";
import { GithubOutlined } from "@ant-design/icons";
// import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/stockico.png"
          alt="Game Logo"
          width={700}
          height={500}
          priority
        />
        <div className={styles.ctas}>
          <Button
            type="primary"
            variant="solid"
            onClick={() => router.push("/login")}
            block
          >
            Login
          </Button>
          {/* <Button
            type="primary"
            variant="solid"
            color="gold"
            onClick={() => window.open("/register", "_blank")}
          >
            Register New User
          </Button> */}
        </div>
      </main>
      <footer className={styles.footer}>
        <Button
          type="link"
          icon={<GithubOutlined />}
          // icon={<GithubOutlined style={{ color: "#971a1a" }} />}
          href="https://github.com/LiakosKari"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ilias Karagiannakis
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
          // icon={<GithubOutlined style={{ color: "#971a1a" }} />}
          href="https://github.com/shirleyl1220"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shirley Feng Yi Lau
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
          // icon={<GithubOutlined style={{ color: "#971a1a" }} />}
          href="https://github.com/JianwenCao"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jianwen Cao
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
          // icon={<GithubOutlined style={{ color: "#971a1a" }} />}
          href="https://github.com/sing-git"
          target="_blank"
          rel="noopener noreferrer"
        >
          SeungJu Paek
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
          // icon={<GithubOutlined style={{ color: "#971a1a" }} />}
          href="https://github.com/JuliusLhamo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Julius Landes
        </Button>
      </footer>
    </div>
  );
}
