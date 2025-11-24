import React from "react";
import { Body, Container, Head, Html, Preview, Text } from "@react-email/components";

interface InquiryResponseEmailProps {
  name: string;
  response: string;
  subject: string;
}

export function InquiryResponseEmail({
  name,
  response,
  subject,
}: InquiryResponseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Response to your inquiry: {subject}</Preview>
      <Body style={bodyStyles}>
        <Container style={containerStyles}>
          <Text style={headingStyles}>Hi {name},</Text>
          <Text style={textStyles}>Thank you for reaching out to us.</Text>
          <Text style={textStyles}>{response}</Text>
          <Text style={footerStyles}>
            If you have more questions, simply reply to this email and we will
            get back to you.
          </Text>
          <Text style={footerStyles}>The Zigma Institute Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyles = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  backgroundColor: "#f4f4f5",
  padding: "24px",
};

const containerStyles = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const headingStyles = {
  fontSize: "18px",
  fontWeight: 600,
  marginBottom: "12px",
};

const textStyles = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#18181b",
  marginBottom: "12px",
};

const footerStyles = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#71717a",
  marginTop: "16px",
};

export default InquiryResponseEmail;
