"use client"

import { useState } from "react"
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Modal, Alert, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

// Mock product data
const products = [
  {
    id: 1,
    name: "Premium Cat Food",
    brand: "Whiskas",
    price: 45,
    stock: 24,
    category: "Food",
    status: "active",
    image: "https://via.placeholder.com/120x120",
    sales: 156,
  },
  {
    id: 2,
    name: "Adult Dog Food",
    brand: "Pedigree",
    price: 125,
    stock: 8,
    category: "Food",
    status: "low_stock",
    image: "https://via.placeholder.com/120x120",
    sales: 89,
  },
  {
    id: 3,
    name: "Dog Chow Complete",
    brand: "Dog Chow",
    price: 40,
    stock: 0,
    category: "Food",
    status: "out_of_stock",
    image: "https://via.placeholder.com/120x120",
    sales: 234,
  },
  {
    id: 4,
    name: "Kitten Food",
    brand: "Kitekat",
    price: 29,
    stock: 45,
    category: "Food",
    status: "active",
    image: "https://via.placeholder.com/120x120",
    sales: 67,
  },
  {
    id: 5,
    name: "Premium Dog Treats",
    brand: "Cesar",
    price: 18,
    stock: 12,
    category: "Accessories",
    status: "active",
    image: "https://via.placeholder.com/120x120",
    sales: 123,
  },
  {
    id: 6,
    name: "Dry Dog Food",
    brand: "Kibbles",
    price: 55,
    stock: 33,
    category: "Food",
    status: "active",
    image: "https://via.placeholder.com/120x120",
    sales: 198,
  },
]

const categories = ["All", "Food", "Accessories", "Toys"]

interface Product {
  id: number
  name: string
  brand: string
  price: number
  stock: number
  category: string
  status: string
  image: string
  sales: number
}

export default function ProductManagementScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductActions, setShowProductActions] = useState(false)

  // Form states for adding product
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "",
    category: "Food",
    description: "",
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <View className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-green-800 text-xs font-medium">Active</Text>
          </View>
        )
      case "low_stock":
        return (
          <View className="bg-yellow-100 px-2 py-1 rounded-full">
            <Text className="text-yellow-800 text-xs font-medium">Low Stock</Text>
          </View>
        )
      case "out_of_stock":
        return (
          <View className="bg-red-100 px-2 py-1 rounded-full">
            <Text className="text-red-800 text-xs font-medium">Out of Stock</Text>
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

  const handleProductAction = (product: Product, action: string) => {
    switch (action) {
      case "view":
        Alert.alert("View Product", `Viewing details for ${product.name}`)
        break
      case "edit":
        Alert.alert("Edit Product", `Editing ${product.name}`)
        break
      case "delete":
        Alert.alert("Delete Product", `Are you sure you want to delete ${product.name}?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => console.log("Deleted") },
        ])
        break
    }
    setShowProductActions(false)
    setSelectedProduct(null)
  }

  const handleAddProduct = () => {
    console.log("Adding product:", newProduct)
    setIsAddProductModalVisible(false)
    setNewProduct({
      name: "",
      brand: "",
      price: "",
      stock: "",
      category: "Food",
      description: "",
    })
    Alert.alert("Success", "Product added successfully!")
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">Product Management</Text>
          <TouchableOpacity
            className="bg-orange-500 px-4 py-2 rounded-lg flex-row items-center"
            onPress={() => setIsAddProductModalVisible(true)}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="relative mb-4">
          <View className="absolute left-3 top-3 z-10">
            <Ionicons name="search" size={16} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Search products..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="bg-gray-100 rounded-lg pl-10 pr-4 py-3 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg ${selectedCategory === category ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <Text className={`font-medium ${selectedCategory === category ? "text-white" : "text-gray-700"}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView className="flex-1 px-4 py-4">
        {filteredProducts.map((product) => (
          <View key={product.id} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-3">
              {getStatusBadge(product.status)}
              <TouchableOpacity
                onPress={() => {
                  setSelectedProduct(product)
                  setShowProductActions(true)
                }}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <Image source={{ uri: product.image }} className="w-20 h-20 rounded-lg" resizeMode="cover" />
              <View className="flex-1">
                <Text className="text-xs text-orange-600 font-medium mb-1">{product.brand}</Text>
                <Text className="font-semibold text-sm text-gray-900 mb-2" numberOfLines={2}>
                  {product.name}
                </Text>
                <View className="space-y-1">
                  <Text className="text-lg font-bold text-gray-900">${product.price}</Text>
                  <Text className="text-xs text-gray-600">
                    Stock:{" "}
                    <Text className={product.stock <= 10 ? "text-red-600 font-medium" : ""}>{product.stock}</Text>
                  </Text>
                  <Text className="text-xs text-gray-600">Sales: {product.sales}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                className="flex-1 border border-gray-300 rounded-lg py-2 flex-row items-center justify-center"
                onPress={() => handleProductAction(product, "edit")}
              >
                <Ionicons name="create-outline" size={14} color="#6B7280" />
                <Text className="text-gray-700 ml-1 text-sm">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 border border-gray-300 rounded-lg py-2 flex-row items-center justify-center"
                onPress={() => handleProductAction(product, "view")}
              >
                <Ionicons name="eye-outline" size={14} color="#6B7280" />
                <Text className="text-gray-700 ml-1 text-sm">View</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredProducts.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
            <Text className="text-lg font-medium text-gray-900 mb-2 mt-4">No products found</Text>
            <Text className="text-gray-600 mb-4 text-center">Try adjusting your search or filter criteria</Text>
            <TouchableOpacity
              className="bg-orange-500 px-6 py-3 rounded-lg flex-row items-center"
              onPress={() => setIsAddProductModalVisible(true)}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text className="text-white font-medium ml-2">Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={isAddProductModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setIsAddProductModalVisible(false)}>
              <Text className="text-orange-500 font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Add New Product</Text>
            <TouchableOpacity onPress={handleAddProduct}>
              <Text className="text-orange-500 font-medium">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Product Name</Text>
                <TextInput
                  value={newProduct.name}
                  onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
                  placeholder="Enter product name"
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Brand</Text>
                <TextInput
                  value={newProduct.brand}
                  onChangeText={(text) => setNewProduct({ ...newProduct, brand: text })}
                  placeholder="Enter brand name"
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Price ($)</Text>
                <TextInput
                  value={newProduct.price}
                  onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Stock Quantity</Text>
                <TextInput
                  value={newProduct.stock}
                  onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
                  placeholder="0"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-lg px-3 py-3"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
                <View className="border border-gray-300 rounded-lg">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
                    <View className="flex-row gap-2">
                      {["Food", "Accessories", "Toys"].map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => setNewProduct({ ...newProduct, category: cat })}
                          className={`px-3 py-2 rounded-lg ${
                            newProduct.category === cat ? "bg-orange-500" : "bg-gray-200"
                          }`}
                        >
                          <Text className={newProduct.category === cat ? "text-white" : "text-gray-700"}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
                <TextInput
                  value={newProduct.description}
                  onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
                  placeholder="Enter product description"
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-lg px-3 py-3 h-24"
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Product Actions Modal */}
      <Modal
        visible={showProductActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProductActions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowProductActions(false)}
        >
          <View className="bg-white rounded-t-xl p-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-semibold mb-4">Product Actions</Text>

            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={() => selectedProduct && handleProductAction(selectedProduct, "view")}
            >
              <Ionicons name="eye-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-900">View Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={() => selectedProduct && handleProductAction(selectedProduct, "edit")}
            >
              <Ionicons name="create-outline" size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-900">Edit Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-3"
              onPress={() => selectedProduct && handleProductAction(selectedProduct, "delete")}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text className="ml-3 text-red-500">Delete Product</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}
