import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Calendar,
  DollarSign
} from "lucide-react";

interface Payment {
  id: string;
  type: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  transactionId?: string;
}

interface PaymentHistory {
  id: string;
  type: string;
  description: string;
  amount: number;
  paidDate: string;
  transactionId: string;
  method: string;
}

export const PaymentSection = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPayments = localStorage.getItem('studentPayments');
    const savedHistory = localStorage.getItem('paymentHistory');
    
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      // Initialize with mock data
      const mockPayments: Payment[] = [
        {
          id: '1',
          type: 'Tuition Fee',
          description: 'Semester 1 - Computer Science',
          amount: 2500,
          dueDate: '2024-12-15',
          status: 'pending'
        },
        {
          id: '2',
          type: 'Lab Fee',
          description: 'Physics Lab Equipment Fee',
          amount: 150,
          dueDate: '2024-12-10',
          status: 'pending'
        },
        {
          id: '3',
          type: 'Library Fee',
          description: 'Annual Library Access Fee',
          amount: 75,
          dueDate: '2024-11-30',
          status: 'overdue'
        }
      ];
      setPayments(mockPayments);
      localStorage.setItem('studentPayments', JSON.stringify(mockPayments));
    }

    if (savedHistory) {
      setPaymentHistory(JSON.parse(savedHistory));
    } else {
      // Initialize with mock history
      const mockHistory: PaymentHistory[] = [
        {
          id: 'hist1',
          type: 'Registration Fee',
          description: 'Student Registration - Fall 2024',
          amount: 200,
          paidDate: '2024-08-15',
          transactionId: 'TXN001',
          method: 'Credit Card'
        },
        {
          id: 'hist2',
          type: 'Tuition Fee',
          description: 'Previous Semester Payment',
          amount: 2400,
          paidDate: '2024-07-20',
          transactionId: 'TXN002',
          method: 'Bank Transfer'
        }
      ];
      setPaymentHistory(mockHistory);
      localStorage.setItem('paymentHistory', JSON.stringify(mockHistory));
    }
  }, []);

  const getTotalPending = () => {
    return payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((total, p) => total + p.amount, 0);
  };

  const getOverdueCount = () => {
    return payments.filter(p => p.status === 'overdue').length;
  };

  const handlePayment = () => {
    if (!selectedPayment) return;

    // Simulate payment processing
    toast.info("Processing payment...");
    
    setTimeout(() => {
      const transactionId = `TXN${Date.now()}`;
      
      // Move to payment history
      const newHistoryItem: PaymentHistory = {
        id: `hist_${Date.now()}`,
        type: selectedPayment.type,
        description: selectedPayment.description,
        amount: selectedPayment.amount,
        paidDate: new Date().toISOString().split('T')[0],
        transactionId,
        method: 'Credit Card'
      };

      const updatedHistory = [...paymentHistory, newHistoryItem];
      setPaymentHistory(updatedHistory);
      localStorage.setItem('paymentHistory', JSON.stringify(updatedHistory));

      // Remove from pending payments
      const updatedPayments = payments.filter(p => p.id !== selectedPayment.id);
      setPayments(updatedPayments);
      localStorage.setItem('studentPayments', JSON.stringify(updatedPayments));

      setShowPaymentDialog(false);
      setSelectedPayment(null);
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
      
      toast.success(`Payment of $${selectedPayment.amount} processed successfully!`);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payments</h2>
          <p className="text-muted-foreground">Manage your fee payments and view transaction history</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-xl font-bold">${getTotalPending()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold">{getOverdueCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid This Year</p>
                <p className="text-xl font-bold">{paymentHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Pending and History */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending Payments
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Payment History
          </TabsTrigger>
        </TabsList>

        {/* Pending Payments */}
        <TabsContent value="pending" className="space-y-4">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">You have no pending payments at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {payments.map((payment) => (
                <Card key={payment.id} className={`hover:shadow-lg transition-shadow ${payment.status === 'overdue' ? 'border-destructive/50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{payment.type}</h3>
                            <p className="text-muted-foreground">{payment.description}</p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-foreground">${payment.amount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentDialog(true);
                            }}
                            className="gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            Pay Now
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payment History */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {paymentHistory.map((payment) => (
              <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{payment.type}</h3>
                          <p className="text-muted-foreground">{payment.description}</p>
                        </div>
                        <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium text-foreground">${payment.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Paid: {new Date(payment.paidDate).toLocaleDateString()}</span>
                        </div>
                        <span>ID: {payment.transactionId}</span>
                        <span>{payment.method}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download Receipt
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold">{selectedPayment.type}</h3>
                <p className="text-sm text-muted-foreground">{selectedPayment.description}</p>
                <p className="text-xl font-bold mt-2">${selectedPayment.amount}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      placeholder="123"
                    />
                  </div>
                </div>

                <Button onClick={handlePayment} className="w-full" size="lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${selectedPayment.amount}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};