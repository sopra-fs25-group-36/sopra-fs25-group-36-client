"use client";

import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Input, Button, Form, Alert, DatePicker, Radio, Image } from "antd";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";
import Logo from "@/components/Logo";

// Define the avatar options
const avatarOptions = [
  { index: 1, label: "Bill Gates", value: "/avatars/avatar1.jpg" },
  { index: 2, label: "Elon Mask", value: "/avatars/avatar2.jpg" },
  // { index: 3, label: "Jeff Bezos", value: "/avatars/avatar3.jpg" },
  { index: 4, label: "Avatar 4", value: "/avatars/avatar4.jpg" },
  // { index: 5, label: "Mark Zukenberg", value: "/avatars/avatar5.jpg" },
  { index: 6, label: "Avatar 6", value: "/avatars/avatar6.jpg" },
  { index: 7, label: "Steve Jobs", value: "/avatars/avatar7.jpg" },
  // { index: 8, label: "Avatar 8", value: "/avatars/avatar8.jpg" },
  // { index: 9, label: "Avatar 9", value: "/avatars/avatar9.jpg" },
];

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<number>("id", 0);
  // const { set: setAvatarNumber } = useLocalStorage<number>("avatarNumber", 0); // New line for avatar number
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleRegister = async (values: {
    username: string;
    password: string;
    birthday: Date;
    email: string;
    avatar: number;
  }) => {
    try {
      const utcBirthday = values.birthday
        ? values.birthday.toISOString().split("T")[0]
        : null;

      // Find the selected avatar
      // const selectedAvatar = avatarOptions.find(
      //   (opt) => opt.index === values.avatar
      // );

      const response = await apiService.post<{ token: string; id: number }>(
        "/register",
        {
          ...values,
          birthday: utcBirthday,
          avatar: values.avatar, // Store the index/number
        }
      );

      if (response.token && response.id) {
        setToken(response.token);
        setUserId(response.id);
        router.push("/users");
      }
    } catch (error) {
      setErrorMessage("Registration failed: " + (error as Error).message);
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
        {/* <Form.Item
          name="email"
          label="E-Mail"
          rules={[
            { required: true, message: "Please input your E-Mail address!" },
            {
              type: "email",
              message: "Please enter a valid email address!",
            },
          ]}
        >
          <Input
            type="email"
            placeholder="Enter your E-Mail Address"
            autoComplete="new-password"
            aria-label="Email address"
          />
        </Form.Item> */}

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
        <a href="/login" target="_blank" rel="noopener noreferrer">
          Login
        </a>
      </p>
    </div>
  );
};

export default Register;
