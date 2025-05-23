"use client";

import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Input, Button, Form, Alert, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";
import Logo from "@/components/Logo";
import { User } from "@/types/user";

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUser } = useLocalStorage<User | null>("user", null);
  const { set: setID } = useLocalStorage<number>("id", 0);
  const [errorMessage] = useState<string>("");

  const handleRegister = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      const payload = {
        name: values.username,
        username: values.username,
        password: values.password,
      };
      const response = await apiService.post<User>("/users", payload);
      if (response.token) {
        setToken(response.token);
        setID(response.id);
        message.success("register successful!");
        router.push("/login");
      } else {
        throw new Error("No token received from the server.");
      }
      const autoLoginResponse = await apiService.post<User>(
        "/users/login",
        payload
      );
      setUser(autoLoginResponse);
      router.push("/login");
    } catch (error) {
      alert("Signup was not successful: " + (error as Error).message);
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
      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 10 }}
        />
      )}
      <Form
        form={form}
        name="register"
        size="large"
        layout="vertical"
        onFinish={handleRegister}
      >
        <Form.Item
          name="username"
          label="Create Username"
          rules={[
            { required: true, message: "Please input your unique username!" },
          ]}
        >
          <Input placeholder="Create a username" autoFocus autoComplete="off" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Create Password"
          rules={[
            { required: true, message: "Please input your password!" },
            {
              pattern:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/,
              message:
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
            },
          ]}
        >
          <Input.Password
            placeholder="Create your password"
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          name="verify"
          label="Verify Password"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please input your password again!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Verify your password"
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
      <p style={{ marginTop: 10 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;
