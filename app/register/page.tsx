"use client";

import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Input, Button, Form, Typography, Alert, DatePicker } from "antd";
import dayjs from "dayjs";
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
    birthday: Date; // Make birthday optional
    email: string;
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
    <div style={{ maxWidth: 400, margin: "50px auto", padding: 2 }}>
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
            autoFocus
            autoComplete="new-password" // To prevent browser auto-filling for email
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
            placeholder="dd.MM.YYYY"
            autoFocus
            autoComplete="off"
            style={{ width: "100%" }} // Ensure it fills the container
          />
        </Form.Item>
        <br></br>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign Up
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
