"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input, message } from "antd";
import Logo from "@/components/Logo";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setID } = useLocalStorage<number>("id", 0);

  const handleLogin = async (values: FormFieldProps) => {
    setLoading(true);
    try {
      const response = await apiService.post<{ token: string; id: number }>(
        "/users/login",
        values
      );

      if (response.token) {
        setToken(response.token);
        setID(response.id);
        message.success("Login successful!");
        router.push("/users");
      } else {
        throw new Error("No token received from the server.");
      }
    } catch (error) {
      message.error(
        error instanceof Error
          ? `Something went wrong during the login:\n${error.message}`
          : "An unknown error occurred during login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", padding: 2 }}>
      <Logo />
      <Form
        form={form}
        name="login"
        size="large"
        onFinish={handleLogin}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          {/* <Form.Item
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        > */}
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
      <p style={{ marginTop: 10, textAlign: "center" }}>
        You do not have an account?{" "}
        <a href="/register" target="_blank" rel="noopener noreferrer">
          Register
        </a>
      </p>
    </div>
  );
};

export default Login;
