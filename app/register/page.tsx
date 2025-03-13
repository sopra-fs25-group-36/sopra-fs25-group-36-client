"use client";

import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Input, Button, Form, Typography, Alert } from "antd";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";

const { Title } = Typography;

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<number>("id", 0); // Add this line to set the user ID
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleRegister = async (values: {
    username: string;
    password: string;
    birthday?: Date; // Make birthday optional
  }) => {
    try {
      // Convert the birthday to a UTC date string if provided
      const utcBirthday = values.birthday
        ? values.birthday.toISOString().split("T")[0]
        : null;

      const response = await apiService.post<{ token: string; id: number }>(
        "/register",
        {
          ...values,
          birthday: utcBirthday, // Send the UTC date string or null
        }
      );

      if (response.token && response.id) {
        setToken(response.token); // Set the token in local storage
        setUserId(response.id); // Set the user ID in local storage
        router.push("/users");
      }
    } catch (error) {
      setErrorMessage("Registration failed: " + (error as Error).message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 2 }}>
      <Title level={2}>Registration Form</Title>
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
          <Input placeholder="Create a username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Create Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Create your password" />
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
          <Input.Password placeholder="Verify your password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>
      <p style={{ marginTop: 10, textAlign: "center" }}>
        Already have an account?{" "}
        <a onClick={() => router.push("/login")} style={{ cursor: "pointer" }}>
          Login
        </a>
      </p>
    </div>
  );
};

export default Register;
