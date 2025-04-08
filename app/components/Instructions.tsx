import React, { useState } from "react";
import { Button, Modal } from "antd";

interface Step {
  title: string;
  content: string;
}

interface InstructionsProps {
  visible: boolean;
  steps: Step[];
  onClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({
  visible,
  steps,
  onClose,
}) => {
  const [step, setStep] = useState<number>(0);

  const nextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  // Button shared styles (Updated for primary look)
  const buttonStyle: React.CSSProperties = {
    width: "120px",
    padding: "8px 16px",
    borderRadius: "24px", // Adjusting to match the primary button style
    fontSize: "14px",
    backgroundColor: "#1890ff", // Primary color
    color: "#fff",
    borderColor: "#1890ff", // Same border color for primary
    fontWeight: "500", // Optional: matching the font-weight of a primary button
    // Removed textTransform and letterSpacing for compatibility with Ant Design typings
  };

  return (
    <Modal
      title={steps[step]?.title}
      visible={visible}
      onCancel={onClose}
      footer={[
        <div
          key="buttons"
          style={{
            display: "flex",
            justifyContent: step > 0 ? "space-between" : "flex-end",
            width: "100%",
          }}
        >
          {step > 0 && (
            <Button key="prev" onClick={prevStep} style={buttonStyle}>
              Previous
            </Button>
          )}

          {step < steps.length - 1 ? (
            <Button
              key="next"
              type="primary" // You can keep the 'primary' here, but it's optional since styles are shared
              onClick={nextStep}
              style={buttonStyle}
            >
              Next
            </Button>
          ) : (
            <Button
              key="close"
              type="primary" // Keep the 'primary' here for consistency
              onClick={onClose}
              style={buttonStyle}
            >
              Got it!
            </Button>
          )}
        </div>,
      ]}
    >
      <p>{steps[step]?.content}</p>
    </Modal>
  );
};

export default Instructions;
