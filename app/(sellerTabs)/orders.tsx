"use client"

import { useState } from "react"
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Modal, Alert, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

// Mock order data
const orders = [
  {
    id: "ORD-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    customerPhone: "+1 (555) 123-4567",
    status: "pending",
    orderDate: "2024-01-15",
    totalAmount: 89.5,
    shippingAddress: "123 Main St, New York, NY 10001",
    products: [
      {
        id: 1,
        name: "Premium Cat Food",
        brand: "Whiskas",
        price: 45,
        quantity: 2,
        image: "https://via.placeholder.com/60x60",
      },
    ],
    paymentMethod: "Credit Card",
    trackingNumber: null,
  },
  {
    id: "ORD-002",
    customerName: "Mike Chen",
    customerEmail: "mike.chen@email.com",
    customerPhone: "+1 (555) 987-6543",
    status: "processing",
    orderDate: "2024-01-14",
    totalAmount: 143.75,
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
    products: [
      {
        id: 2,
        name: "Adult Dog Food",
        brand: "Pedigree",
        price: 125,
        quantity: 1,
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
    ],
    paymentMethod: "PayPal",
    trackingNumber: "TRK123456789",
  },
  {
    id: "ORD-003",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@email.com",
    customerPhone: "+1 (555) 456-7890",
    status: "shipped",
    orderDate: "2024-01-13",
    totalAmount: 74.0,
    shippingAddress: "789 Pine St, Chicago, IL 60601",
    products: [
      {
        id: 4,
        name: "Kitten Food",
        brand: "Kitekat",
        price: 29,
        quantity: 1,
        image: "https://via.placeholder.com/60x60",
      },
      {
        id: 1,
        name: "Premium Cat Food",
        brand: "Whiskas",
        price: 45,
        quantity: 1,
        image: "https://via.placeholder.com/60x60",
      },
    ],
    paymentMethod: "Credit Card",
    trackingNumber: "TRK987654321",
  },
  {
    id: "ORD-004",
    customerName: "David Wilson",
    customerEmail: "david.w@email.com",
    customerPhone: "+1 (555) 321-0987",
    status: "delivered",
    orderDate: "2024-01-12",
    totalAmount: 55.0,
    shippingAddress: "321 Elm St, Miami, FL 33101",
    products: [
      {
        id: 6,
        name: "Dry Dog Food",
        brand: "Kibbles",
        price: 55,
        quantity: 1,
        image: "https://via.placeholder.com/60x60",
      },
    ],
    paymentMethod: "Apple Pay",
    trackingNumber: "TRK456789123",
  },
  {
    id: "ORD-005",
    customerName: "Lisa Thompson",
    customerEmail: "lisa.t@email.com",
    customerPhone: "+1 (555) 654-3210",
    status: "cancelled",
    orderDate: "2024-01-11",
    totalAmount: 40.0,
    shippingAddress: "654 Maple Dr, Seattle, WA 98101",
    products: [
      {
        id: 3,
        name: "Dog Chow Complete",
        brand: "Dog Chow",
        price: 40,
        quantity: 1,
        image: "https://via.placeholder.com/60x60",
      },
    ],
    paymentMethod: "Credit Card",
    trackingNumber: null,
  },
]

const orderStatuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: string
  orderDate: string
  totalAmount: number
  shippingAddress: string
  products: Array<{
    id: number
    name: string
    brand: string
    price: number
    quantity: number
    image: string
  }>
  paymentMethod: string
  trackingNumber: string | null
}

export default function OrderManagementScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || order.status.toLowerCase() === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <View className="bg-yellow-100 px-2 py-1 rounded-full">
            <Text className="text-yellow-800 text-xs font-medium">Pending</Text>
          </View>
        )
      case "processing":
        return (
          <View className="bg-blue-100 px-2 py-1 rounded-full">
            <Text className="text-blue-800 text-xs font-medium">Processing</Text>
          </View>
        )
      case "shipped":
        return (
          <View className="bg-purple-100 px-2 py-1 rounded-full">
            <Text className="text-purple-800 text-xs font-medium">Shipped</Text>
          </View>
        )
      case "delivered":
        return (
          <View className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-green-800 text-xs font-medium">Delivered</Text>
          </View>
        )
      case "cancelled":
        return (
          <View className="bg-red-100 px-2 py-1 rounded-full">
            <Text className="text-red-800 text-xs font-medium">Cancelled</Text>
          </View>
        )
      default:
        return (
          <View className="bg-gray-100 px-2 py-1 rounded-full">
            <Text className="text-gray-800 text-xs font-medium">Unknown</Text>
          </View>
        )
    }
  }

  const handleStatusUpdate = (newStatus: string) => {
    if (selectedOrder) {
      Alert.alert("Status Updated", `Order ${selectedOrder.id} status updated to ${newStatus}`)
      setShowStatusUpdate(false)
      setSelectedOrder(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">Orders</Text>
          <View className="bg-orange-100 px-3 py-1 rounded-full">
            <Text className="text-orange-800 text-sm font-medium">{filteredOrders.length} Orders</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative mb-4">
          <View className="absolute left-3 top-3 z-10">
            <Ionicons name="search" size={16} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Search orders, customers..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="bg-gray-100 rounded-lg pl-10 pr-4 py-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Status Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2">
            {orderStatuses.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg ${selectedStatus === status ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <Text className={`font-medium ${selectedStatus === status ? "text-white" : "text-gray-700"}`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 px-4 py-4">
        {filteredOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            onPress={() => {
              setSelectedOrder(order)
              setShowOrderDetails(true)
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-lg font-bold text-gray-900">#{order.id}</Text>
                <Text className="text-sm text-gray-600">{formatDate(order.orderDate)}</Text>
              </View>
              <View className="items-end">
                {getStatusBadge(order.status)}
                <Text className="text-lg font-bold text-gray-900 mt-1">${order.totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-3">
              <View className="flex-row items-center mb-2">
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text className="text-gray-900 ml-2 font-medium">{order.customerName}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="mail-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2 text-sm">{order.customerEmail}</Text>
              </View>
              <View className="flex-row items-center mb-3">
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2 text-sm" numberOfLines={1}>
                  {order.shippingAddress}
                </Text>
              </View>

              {/* Products Preview */}
              <View className="border-t border-gray-100 pt-3">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  {order.products.length} item{order.products.length > 1 ? "s" : ""}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {order.products.map((product, index) => (
                      <View key={index} className="flex-row items-center bg-gray-50 rounded-lg p-2 min-w-[200px]">
                        <Image source={{ uri: product.image }} className="w-10 h-10 rounded" resizeMode="cover" />
                        <View className="ml-2 flex-1">
                          <Text className="text-xs text-orange-600 font-medium">{product.brand}</Text>
                          <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text className="text-xs text-gray-600">
                            Qty: {product.quantity} × ${product.price}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
              <TouchableOpacity
                className="flex-1 bg-orange-500 rounded-lg py-2 flex-row items-center justify-center"
                onPress={() => {
                  setSelectedOrder(order)
                  setShowStatusUpdate(true)
                }}
              >
                <Ionicons name="refresh-outline" size={14} color="white" />
                <Text className="text-white ml-1 text-sm font-medium">Update Status</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 border border-gray-300 rounded-lg py-2 flex-row items-center justify-center"
                onPress={() => {
                  setSelectedOrder(order)
                  setShowOrderDetails(true)
                }}
              >
                <Ionicons name="eye-outline" size={14} color="#6B7280" />
                <Text className="text-gray-700 ml-1 text-sm">View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredOrders.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            <Text className="text-lg font-medium text-gray-900 mb-2 mt-4">No orders found</Text>
            <Text className="text-gray-600 text-center">Try adjusting your search or filter criteria</Text>
          </View>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal visible={showOrderDetails} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Order Details</Text>
            <TouchableOpacity
              onPress={() => {
                setShowOrderDetails(false)
                setShowStatusUpdate(true)
              }}
            >
              <Text className="text-orange-500 font-medium">Update</Text>
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <ScrollView className="flex-1 p-4">
              <View className="space-y-6">
                {/* Order Info */}
                <View className="bg-gray-50 rounded-lg p-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-xl font-bold text-gray-900">#{selectedOrder.id}</Text>
                      <Text className="text-gray-600">{formatDate(selectedOrder.orderDate)}</Text>
                    </View>
                    <View className="items-end">
                      {getStatusBadge(selectedOrder.status)}
                      <Text className="text-xl font-bold text-gray-900 mt-2">
                        ${selectedOrder.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  {selectedOrder.trackingNumber && (
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="cube-outline" size={16} color="#6B7280" />
                      <Text className="text-gray-600 ml-2">Tracking: {selectedOrder.trackingNumber}</Text>
                    </View>
                  )}
                </View>

                {/* Customer Info */}
                <View>
                  <Text className="text-lg font-semibold text-gray-900 mb-3">Customer Information</Text>
                  <View className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <View className="flex-row items-center">
                      <Ionicons name="person-outline" size={20} color="#6B7280" />
                      <Text className="text-gray-900 ml-3 font-medium">{selectedOrder.customerName}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="mail-outline" size={20} color="#6B7280" />
                      <Text className="text-gray-600 ml-3">{selectedOrder.customerEmail}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="call-outline" size={20} color="#6B7280" />
                      <Text className="text-gray-600 ml-3">{selectedOrder.customerPhone}</Text>
                    </View>
                    <View className="flex-row items-start">
                      <Ionicons name="location-outline" size={20} color="#6B7280" />
                      <Text className="text-gray-600 ml-3 flex-1">{selectedOrder.shippingAddress}</Text>
                    </View>
                  </View>
                </View>

                {/* Products */}
                <View>
                  <Text className="text-lg font-semibold text-gray-900 mb-3">Order Items</Text>
                  <View className="space-y-3">
                    {selectedOrder.products.map((product, index) => (
                      <View key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <View className="flex-row gap-3">
                          <Image source={{ uri: product.image }} className="w-16 h-16 rounded-lg" resizeMode="cover" />
                          <View className="flex-1">
                            <Text className="text-xs text-orange-600 font-medium mb-1">{product.brand}</Text>
                            <Text className="font-semibold text-gray-900 mb-1">{product.name}</Text>
                            <View className="flex-row justify-between items-center">
                              <Text className="text-gray-600">Qty: {product.quantity}</Text>
                              <Text className="font-bold text-gray-900">
                                ${(product.price * product.quantity).toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Payment Info */}
                <View>
                  <Text className="text-lg font-semibold text-gray-900 mb-3">Payment Information</Text>
                  <View className="bg-white border border-gray-200 rounded-lg p-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-600">Payment Method</Text>
                      <Text className="font-medium text-gray-900">{selectedOrder.paymentMethod}</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600">Total Amount</Text>
                      <Text className="text-xl font-bold text-gray-900">${selectedOrder.totalAmount.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusUpdate}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusUpdate(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowStatusUpdate(false)}
        >
          <View className="bg-white rounded-t-xl p-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-semibold mb-4">Update Order Status</Text>

            {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
              <TouchableOpacity
                key={status}
                className="flex-row items-center justify-between py-3"
                onPress={() => handleStatusUpdate(status)}
              >
                <View className="flex-row items-center">
                  {getStatusBadge(status)}
                  <Text className="ml-3 text-gray-900 capitalize">{status}</Text>
                </View>
                {selectedOrder?.status === status && <Ionicons name="checkmark" size={20} color="#10B981" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}
