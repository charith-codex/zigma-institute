import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

type PaymentInvoiceProps = {
  orderId: string;
  userName?: string;
  amount?: string;
  date?: string;
  paymentMethod?: string;
};

export default function PaymentInvoice({
  orderId,
  userName = "Student",
  amount = "2500.00",
  date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
  paymentMethod = "Online Payment",
}: PaymentInvoiceProps) {
  return (
    <Html>
      <Preview>Your Payment Invoice - Zigma Institute</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-50">
          <Container className="max-w-xl bg-white border border-gray-200 rounded-lg shadow-sm my-10 p-6">
            {/* Header */}
            <Section className="text-center mb-6">
              <Img
                src={`https://84rhl6435s.ufs.sh/f/gbloQ0dk4CNESJb9aVivcpBQJzCbW3H1x8qU6jITSPhG7Xkt`}
                alt="Zigma Institute Logo"
                width="60"
                className="mx-auto mb-2"
              />
              <Heading className="text-xl font-semibold text-gray-800">
                Payment Invoice
              </Heading>
              <Text className="text-sm text-gray-500">
                Thank you for your payment, {userName}!
              </Text>
            </Section>

            {/* Invoice Details */}
            <Section className="border border-solid border-gray-300 rounded-lg p-4 mb-6">
              <Row>
                <Column>
                  <Text className="text-gray-500 m-0">Order ID</Text>
                  <Text className="font-medium text-gray-800">{orderId}</Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-500 m-0">Date</Text>
                  <Text className="font-medium text-gray-800">{date}</Text>
                </Column>
              </Row>
              <Row className="mt-2">
                <Column>
                  <Text className="text-gray-500 m-0">Payment Method</Text>
                  <Text className="font-medium text-gray-800">
                    {paymentMethod}
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-gray-500 m-0">Amount Paid</Text>
                  <Text className="font-medium text-green-600">${amount}</Text>
                </Column>
              </Row>
            </Section>

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-gray-700">
                We have received your payment successfully.
              </Text>
              <Text className="text-gray-700">
                Zigma Institute Accounts Department
              </Text>
              <Text className="text-xs text-gray-400 mt-4">
                This is an automated email. Please do not reply.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
