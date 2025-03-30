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
  { label: "Bill Gates", value: "/avatars/avatar1.jpg" },
  { label: "Elon Mask", value: "/avatars/avatar2.jpg" },
  // { label: "Jeff Bezos", value: "/avatars/avatar3.jpg" },
  { label: "Avatar 4", value: "/avatars/avatar4.jpg" },
  // { label: "Mark Zukenberg", value: "/avatars/avatar5.jpg" },
  { label: "Avatar 6", value: "/avatars/avatar6.jpg" },
  { label: "Steve Jobs", value: "/avatars/avatar7.jpg" },
  // { label: "Avatar 8", value: "/avatars/avatar8.jpg" },
  // { label: "Avatar 9", value: "/avatars/avatar9.jpg" },
];

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<number>("id", 0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleRegister = async (values: {
    username: string;
    password: string;
    birthday: Date;
    email: string;
    avatar: string; // Add avatar to the payload
  }) => {
    try {
      const utcBirthday = values.birthday
        ? values.birthday.toISOString().split("T")[0]
        : null;

      const response = await apiService.post<{ token: string; id: number }>(
        "/register",
        {
          ...values,
          birthday: utcBirthday,
          avatar: values.avatar, // Include the selected avatar
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
        <Form.Item
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
          name="birthday"
          label="Birthday"
          rules={[
            {
              required: true,
              message: "You have to be at least 18 years old",
            },
            {
              validator(_, value) {
                if (!value)
                  return Promise.reject(
                    new Error("Please select your birthdate!")
                  );
                const age = dayjs().diff(value, "year");
                return age >= 18
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("You must be at least 18 years old!")
                    );
              },
            },
          ]}
        >
          <DatePicker
            format="DD.MM.YYYY"
            placeholder="DD.MM.YYYY"
            autoComplete="off"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="avatar"
          label="Select Avatar"
          rules={[{ required: true, message: "Please select an avatar!" }]}
        >
          <Radio.Group>
            {avatarOptions.map((option) => (
              <Radio key={option.value} value={option.value}>
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
          Register
        </a>
      </p>
    </div>
  );
};

export default Register;
