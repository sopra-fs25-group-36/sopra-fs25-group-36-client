"use client";

import { useAuth } from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Card, Descriptions, Modal, Input, Form, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import styles from "../../styles/page.module.css";
import useLocalStorage from "@/hooks/useLocalStorage"; // Import the hook

const UserPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [newBirthday, setNewBirthday] = useState<Date | null>(null);
  const [savingBirthday, setSavingBirthday] = useState(false);

  const { isAuthenticated, isLoading } = useAuth();
  const { value: loggedInUserId } = useLocalStorage<number>("id", 0); // Use the `value` property
  const isLoggedInUser = loggedInUserId === Number(id); // Check if the logged-in user is viewing their own profile

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const user: User = await apiService.get<User>(`/users/${id}`);
        user.birthday = user.birthday ? new Date(user.birthday) : null;
        setUser(user);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, apiService, isAuthenticated, isLoading, router]);

  const handleSaveUsername = async () => {
    if (!newUsername) {
      message.error("Please enter a valid username.");
      return;
    }

    setSavingUsername(true);
    try {
      const updatedUser: User = await apiService.put<User>(`/users/${id}`, {
        username: newUsername,
      });
      setUser(updatedUser);
      message.success("Username updated successfully!");
      setIsEditingUsername(false);
      setNewUsername("");
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the username."
      );
    } finally {
      setSavingUsername(false);
    }
  };

  const handleSaveBirthday = async () => {
    if (!newBirthday) {
      message.error("Please enter a valid birthday.");
      return;
    }

    setSavingBirthday(true);
    try {
      const updatedUser: User = await apiService.put<User>(`/users/${id}`, {
        birthday: newBirthday.toISOString().split("T")[0], // Format as DD.MM.YYYY
      });
      setUser(updatedUser); // This will now work because the backend returns the updated user
      message.success("Birthday updated successfully!");
      setIsEditingBirthday(false);
      setNewBirthday(null);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the birthday."
      );
    } finally {
      setSavingBirthday(false);
    }
  };

  const handleSavePassword = async () => {
    if (!oldPassword || !newPassword) {
      message.error("Please fill in both password fields.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiService.put(`/users/${id}/password`, {
        oldPassword,
        newPassword,
      });
      message.success("Password updated successfully!");
      setIsEditingPassword(false);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the password."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className={styles.userDetailContainer}>
      <Card title={`User Details: ${user.username}`}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Username">
            {user.username}
            {isLoggedInUser && ( // Only show the Edit button if it's the logged-in user
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditingUsername(true);
                  setNewUsername(user.username);
                }}
              />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Status">{user.status}</Descriptions.Item>
          <Descriptions.Item label="Creation Date">
            {user.creation
              ? new Date(user.creation).toLocaleString()
              : "Has NOT being defined yet!!!!"}
          </Descriptions.Item>
          <Descriptions.Item label="Password">
            ********
            {isLoggedInUser && ( // Only show the Edit button if it's the logged-in user
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => setIsEditingPassword(true)}
              />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Birthday">
            {user.birthday
              ? new Date(user.birthday).toLocaleDateString()
              : "Has NOT being defined yet!!!!"}
            {isLoggedInUser && ( // Only show the Edit button if it's the logged-in user
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsEditingBirthday(true);
                  setNewBirthday(user.birthday || null);
                }}
              />
            )}
          </Descriptions.Item>
        </Descriptions>
        <Button
          onClick={() => router.push("/users")}
          type="primary"
          style={{ marginTop: 16 }}
        >
          Back to All Users
        </Button>
      </Card>

      <Modal
        title={<span style={{ color: "red" }}>Update Username</span>}
        open={isEditingUsername}
        onOk={handleSaveUsername}
        onCancel={() => setIsEditingUsername(false)}
        confirmLoading={savingUsername}
      >
        <Form layout="vertical">
          <Form.Item
            label={<span style={{ color: "red" }}>New Username</span>}
            required
          >
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={<span style={{ color: "red" }}>Edit Password</span>}
        open={isEditingPassword}
        onOk={handleSavePassword}
        onCancel={() => setIsEditingPassword(false)}
        confirmLoading={savingPassword}
      >
        <Form layout="vertical">
          <Form.Item
            label={<span style={{ color: "red" }}>Old Password</span>}
            required
          >
            <Input.Password
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "red" }}>New Password</span>}
            required
          >
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span style={{ color: "red" }}>Update Birthday</span>}
        open={isEditingBirthday}
        onOk={handleSaveBirthday}
        onCancel={() => setIsEditingBirthday(false)}
        confirmLoading={savingBirthday}
      >
        <Form layout="vertical">
          <Form.Item
            label={<span style={{ color: "red" }}>New Birthday</span>}
            required
          >
            <Input
              type="date"
              value={newBirthday ? newBirthday.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const dateValue = e.target.value;
                setNewBirthday(dateValue ? new Date(dateValue) : null);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPage;
