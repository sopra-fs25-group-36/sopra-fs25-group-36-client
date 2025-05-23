"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Form, Input, App } from "antd";
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
  const { message } = App.useApp();

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
        router.push(`/users/${response.id}`);
      } else {
        throw new Error("No token received from the server.");
      }
    } catch (error) {
      message.error(
        error instanceof Error
          ? `Username or password is incorrect. Did you already register?`
          : "An unknown error occurred during login."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "20px auto",
        padding: 2,
        textAlign: "center",
      }}
    >
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
          <Input placeholder="Enter username" autoFocus />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
      <p style={{ marginTop: 10 }}>
        You do not have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
};

export default Login;
