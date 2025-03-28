"use client";
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";
import Logo from "@/components/Logo"; // Adjust the import path as needed

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Pass width and height props to Logo */}
        <Logo width={632 / 2} height={209 / 2} />
        <div className={styles.ctas}>
          <Button
            type="primary"
            variant="solid"
            onClick={() => router.push("/login")}
            block
            style={{ height: "60px", fontSize: "20px", padding: "0 30px" }} // Inline styles for Ant Design Button
          >
            Login
          </Button>
        </div>
      </main>
      <footer className={styles.footer}>
        <Button
          type="link"
          icon={<GithubOutlined />}
          href="https://github.com/LiakosKari"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ilias Karagiannakis
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
          href="https://github.com/shirleyl1220"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shirley Feng Yi Lau
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
          href="https://github.com/JianwenCao"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jianwen Cao
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
          href="https://github.com/sing-git"
          target="_blank"
          rel="noopener noreferrer"
        >
          SeungJu Paek
        </Button>
        <Button
          type="link"
          icon={<GithubOutlined />}
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
