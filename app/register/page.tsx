"use client";

import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Input, Button, Form, Alert, Radio, Image, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";
import Logo from "@/components/Logo";
import { User } from "@/types/user";

// Define the avatar options
const avatarOptions = [
  { index: 1, label: "Bill Gates", value: "/avatars/avatar1.jpg" },
  { index: 2, label: "Elon Mask", value: "/avatars/avatar2.jpg" },
  { index: 4, label: "Avatar 4", value: "/avatars/avatar4.jpg" },
  { index: 6, label: "Avatar 6", value: "/avatars/avatar6.jpg" },
  { index: 7, label: "Steve Jobs", value: "/avatars/avatar7.jpg" },
];

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
    // avatar: number;
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
      const autoLoginResponse = await apiService.post<User>("/users/login", payload);
      setUser(autoLoginResponse);
      router.push("/login");
    } catch (error) {
      alert("Signup was not successful: " + (error as Error).message);
    }

  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", padding: 2 }}>
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
          rules={[{ required: true, message: "Please input your password!" }]}
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
        <Form.Item
          name="avatar"
          label="Select Avatar"
          rules={[{ required: true, message: "Please select an avatar!" }]}
        >
          <Radio.Group>
            {avatarOptions.map((option) => (
              <Radio key={option.index} value={option.index}>
                <Image
                  src={option.value}
                  alt={option.label}
                  width={35}
                  height={35}
                  style={{ borderRadius: "50%" }}
                />
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
      <p style={{ marginTop: 10, textAlign: "center" }}>
        Already have an account?{" "}
        <a href="/login">
          Login
        </a>
      </p>
    </div>
  );
};

export default Register;
