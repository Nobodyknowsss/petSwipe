"use client"

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Modal, Alert, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  quantity: number
  image: string
}

interface ShippingAddress {
  fullName: string
  phoneNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "apple_pay" | "google_pay"
  name: string
  details: string
  icon: string
}

// Mock cart data (would come from props or context)
const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: "Premium Cat Food",
    brand: "Whiskas",
    price: 45,
    quantity: 2,
    image: "https://via.placeholder.com/60x60",
  },
  {
    id: 5,
    name: "Premium Dog Treats",
    brand: "Cesar",
    price: 18,
    quantity: 1,
    image: "https://via.placeholder.com/60x60",
  },
]

const paymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "card",
    name: "Credit Card",
    details: "**** **** **** 4242",
    icon: "card-outline",
  },
  {
    id: "2",
    type: "paypal",
    name: "PayPal",
    details: "user@email.com",
    icon: "logo-paypal",
  },
  {
    id: "3",
    type: "apple_pay",
    name: "Apple Pay",
    details: "Touch ID or Face ID",
    icon: "logo-apple",
  },
]

const shippingOptions = [
  {
    id: "1",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 5.99,
    selected: true,
  },
  {
    id: "2",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 12.99,
    selected: false,
  },
  {
    id: "3",
    name: "Next Day Delivery",
    description: "1 business day",
    price: 24.99,
    selected: false,
  },
]

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CheckoutScreen() {
  const [cartItems] = useState<CartItem[]>(mockCartItems)
  const [currentStep, setCurrentStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review
  const [selectedShipping, setSelectedShipping] = useState("1")
  const [selectedPayment, setSelectedPayment] = useState("1")
  const [showAddCard, setShowAddCard] = useState(false)
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)

  // Form states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  })

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const selectedShippingOption = shippingOptions.find((option) => option.id === selectedShipping)
  const shippingCost = selectedShippingOption?.price || 0
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shippingCost + tax

  const validateShippingForm = () => {
    const required = ["fullName", "phoneNumber", "address", "city", "state", "zipCode"]
    return required.every((field) => shippingAddress[field as keyof ShippingAddress].trim() !== "")
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!validateShippingForm()) {
        Alert.alert("Missing Information", "Please fill in all shipping address fields.")
        return
      }

      const { error } = await supabase.from("Shipping_Details").insert([
        {
          full_name: shippingAddress.fullName,
          phone: shippingAddress.phoneNumber,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zipCode,
          country: shippingAddress.country,
          option: selectedShippingOption?.name,
        }
      ])
      if (error) {
        Alert.alert("Error", "Failed to save shipping details. Please try again.");
        return;
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Process order
      setShowOrderSuccess(true)
    }
  }

  const handlePlaceOrder = () => {
    // Simulate order processing
    setTimeout(() => {
      setShowOrderSuccess(true)
    }, 1000)
  }

  const renderStepIndicator = () => (
    <View className="flex-row items-center justify-center py-4 bg-white border-b border-gray-200">
      {[1, 2, 3].map((step, index) => (
        <View key={step} className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              step <= currentStep ? "bg-orange-500" : "bg-gray-300"
            }`}
          >
            <Text className={`font-bold text-sm ${step <= currentStep ? "text-white" : "text-gray-600"}`}>{step}</Text>
          </View>
          <Text className={`ml-2 text-sm ${step <= currentStep ? "text-orange-500" : "text-gray-600"}`}>
            {step === 1 ? "Shipping" : step === 2 ? "Payment" : "Review"}
          </Text>
          {index < 2 && <View className={`w-8 h-0.5 mx-3 ${step < currentStep ? "bg-orange-500" : "bg-gray-300"}`} />}
        </View>
      ))}
    </View>
  )

  const renderShippingStep = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">Shipping Address</Text>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Full Name *</Text>
          <TextInput
            value={shippingAddress.fullName}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, fullName: text })}
            placeholder="Enter your full name"
            className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number *</Text>
          <TextInput
            value={shippingAddress.phoneNumber}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, phoneNumber: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Address *</Text>
          <TextInput
            value={shippingAddress.address}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, address: text })}
            placeholder="Street address"
            className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">City *</Text>
            <TextInput
              value={shippingAddress.city}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
              placeholder="City"
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">State *</Text>
            <TextInput
              value={shippingAddress.state}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, state: text })}
              placeholder="State"
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">ZIP Code *</Text>
            <TextInput
              value={shippingAddress.zipCode}
              onChangeText={(text) => setShippingAddress({ ...shippingAddress, zipCode: text })}
              placeholder="ZIP Code"
              keyboardType="numeric"
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-2">Country</Text>
            <View className="border border-gray-300 rounded-lg px-3 py-3 bg-gray-100">
              <Text className="text-gray-600">{shippingAddress.country}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text className="text-xl font-bold text-gray-900 mt-6 mb-4">Shipping Options</Text>

      {shippingOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          className={`border rounded-lg p-4 mb-3 ${
            selectedShipping === option.id ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
          }`}
          onPress={() => setSelectedShipping(option.id)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-gray-900">{option.name}</Text>
              <Text className="text-gray-600 text-sm">{option.description}</Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-gray-900">${option.price.toFixed(2)}</Text>
              <View
                className={`w-5 h-5 rounded-full border-2 mt-1 ${
                  selectedShipping === option.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
                }`}
              >
                {selectedShipping === option.id && (
                  <View className="w-full h-full rounded-full bg-orange-500 items-center justify-center">
                    <Ionicons name="checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  const renderPaymentStep = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">Payment Method</Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          className={`border rounded-lg p-4 mb-3 ${
            selectedPayment === method.id ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"
          }`}
          onPress={() => setSelectedPayment(method.id)}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons name={method.icon as any} size={24} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-900">{method.name}</Text>
                <Text className="text-gray-600 text-sm">{method.details}</Text>
              </View>
            </View>
            <View
              className={`w-5 h-5 rounded-full border-2 ${
                selectedPayment === method.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
              }`}
            >
              {selectedPayment === method.id && (
                <View className="w-full h-full rounded-full bg-orange-500 items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center"
        onPress={() => setShowAddCard(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#6B7280" />
        <Text className="text-gray-600 mt-2">Add New Payment Method</Text>
      </TouchableOpacity>
    </ScrollView>
  )

  const renderReviewStep = () => (
    <ScrollView className="flex-1 p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">Order Summary</Text>

      {/* Order Items */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="font-semibold text-gray-900 mb-3">Items ({cartItems.length})</Text>
        {cartItems.map((item) => (
          <View key={item.id} className="flex-row items-center mb-3 last:mb-0">
            <Image source={{ uri: item.image }} className="w-12 h-12 rounded-lg" resizeMode="cover" />
            <View className="flex-1 ml-3">
              <Text className="text-xs text-orange-600 font-medium">{item.brand}</Text>
              <Text className="font-medium text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-gray-600 text-sm">Qty: {item.quantity}</Text>
            </View>
            <Text className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="font-semibold text-gray-900 mb-3">Shipping Address</Text>
        <Text className="text-gray-900">{shippingAddress.fullName}</Text>
        <Text className="text-gray-600">{shippingAddress.address}</Text>
        <Text className="text-gray-600">
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
        </Text>
        <Text className="text-gray-600">{shippingAddress.phoneNumber}</Text>
      </View>

      {/* Payment Method */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="font-semibold text-gray-900 mb-3">Payment Method</Text>
        <View className="flex-row items-center">
          <Ionicons name="card-outline" size={20} color="#6B7280" />
          <Text className="text-gray-900 ml-2">Credit Card ending in 4242</Text>
        </View>
      </View>

      {/* Shipping Method */}
      <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <Text className="font-semibold text-gray-900 mb-3">Shipping Method</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-900">{selectedShippingOption?.name}</Text>
          <Text className="font-bold text-gray-900">${selectedShippingOption?.price.toFixed(2)}</Text>
        </View>
        <Text className="text-gray-600 text-sm">{selectedShippingOption?.description}</Text>
      </View>
    </ScrollView>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      {currentStep === 1 && renderShippingStep()}
      {currentStep === 2 && renderPaymentStep()}
      {currentStep === 3 && renderReviewStep()}

      {/* Order Summary Footer */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="space-y-2 mb-4">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-gray-900">${subtotal.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Shipping</Text>
            <Text className="text-gray-900">${shippingCost.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Tax</Text>
            <Text className="text-gray-900">${tax.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between border-t border-gray-200 pt-2">
            <Text className="text-lg font-bold text-gray-900">Total</Text>
            <Text className="text-lg font-bold text-orange-500">${total.toFixed(2)}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          {currentStep > 1 && (
            <TouchableOpacity
              className="flex-1 border border-gray-300 rounded-xl py-4"
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text className="text-gray-700 font-bold text-center">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 bg-orange-500 rounded-xl py-4"
            onPress={currentStep === 3 ? handlePlaceOrder : handleNextStep}
          >
            <Text className="text-white font-bold text-center text-lg">
              {currentStep === 3 ? "Place Order" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Card Modal */}
      <Modal visible={showAddCard} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowAddCard(false)}>
              <Text className="text-orange-500 font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Add Card</Text>
            <TouchableOpacity onPress={() => setShowAddCard(false)}>
              <Text className="text-orange-500 font-medium">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Card Number</Text>
                <TextInput
                  value={newCard.cardNumber}
                  onChangeText={(text) => setNewCard({ ...newCard, cardNumber: text })}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Expiry Date</Text>
                  <TextInput
                    value={newCard.expiryDate}
                    onChangeText={(text) => setNewCard({ ...newCard, expiryDate: text })}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">CVV</Text>
                  <TextInput
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                    className="border border-gray-300 rounded-lg px-3 py-3"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Cardholder Name</Text>
                <TextInput
                  value={newCard.cardholderName}
                  onChangeText={(text) => setNewCard({ ...newCard, cardholderName: text })}
                  placeholder="John Doe"
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Order Success Modal */}
      <Modal visible={showOrderSuccess} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={32} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</Text>
            <Text className="text-gray-600 text-center mb-6">
              Your order has been successfully placed. You&apos;ll receive a confirmation email shortly.
            </Text>
            <View className="w-full space-y-3">
              <TouchableOpacity className="w-full bg-orange-500 rounded-xl py-4">
                <Text className="text-white font-bold text-center">Track Order</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-full border border-gray-300 rounded-xl py-4">
                <Text className="text-gray-700 font-bold text-center">Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
