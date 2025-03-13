"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering
import "@ant-design/v5-patch-for-react-19";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "antd";
import { BookOutlined, CodeOutlined, GlobalOutlined } from "@ant-design/icons";
import styles from "@/styles/page.module.css";

export default function Home() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <h2>Developers</h2>
          <br></br>
          <li>
            <code>Ilias Karagiannakis</code> ilias.karagiannakis@uzh.ch
          </li>
          <li>
            <code>Jianwen Cao</code> jianwen.cao@uzh.ch.
          </li>
          <li>
            <code>Seung Ju Paek</code> seungju.paek@uzh.ch
          </li>
          <li>
            <code>Shirley Feng Yi Lau</code> seungju.paek@uzh.ch
          </li>
          <li>
            <code>Julius Landes</code> juliuslhamo.landes@uzh.ch
          </li>
        </ol>

        <div className={styles.ctas}>
          <Button
            type="primary"
            variant="solid"
            onClick={() => router.push("/login")}
          >
            login
          </Button>
          <Button
            type="primary"
            variant="solid"
            onClick={() => router.push("/register")}
          >
            Register
          </Button>
        </div>
      </main>
      <footer className={styles.footer}>
        <Button
          type="link"
          icon={<BookOutlined />}
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn
        </Button>
        <Button
          type="link"
          icon={<CodeOutlined />}
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Examples
        </Button>
        <Button
          type="link"
          icon={<GlobalOutlined />}
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to nextjs.org →
        </Button>
      </footer>
    </div>
  );
}
