"use client"

import { useState } from "react"
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Modal, Alert, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

// Mock product data (same as seller side but from buyer perspective)
const products = [
  {
    id: 1,
    name: "Premium Cat Food",
    brand: "Whiskas",
    price: 45,
    originalPrice: 52,
    stock: 24,
    category: "Food",
    rating: 4.5,
    reviews: 156,
    image: "https://via.placeholder.com/150x150",
    description: "Premium nutrition for adult cats with real chicken and essential vitamins.",
    isOnSale: true,
  },
  {
    id: 2,
    name: "Adult Dog Food",
    brand: "Pedigree",
    price: 125,
    originalPrice: 125,
    stock: 8,
    category: "Food",
    rating: 4.3,
    reviews: 89,
    image: "https://via.placeholder.com/150x150",
    description: "Complete nutrition for adult dogs with real meat and vegetables.",
    isOnSale: false,
  },
  {
    id: 3,
    name: "Dog Chow Complete",
    brand: "Dog Chow",
    price: 40,
    originalPrice: 45,
    stock: 0,
    category: "Food",
    rating: 4.1,
    reviews: 234,
    image: "https://via.placeholder.com/150x150",
    description: "Complete and balanced nutrition for dogs of all life stages.",
    isOnSale: true,
  },
  {
    id: 4,
    name: "Kitten Food",
    brand: "Kitekat",
    price: 29,
    originalPrice: 29,
    stock: 45,
    category: "Food",
    rating: 4.4,
    reviews: 67,
    image: "https://via.placeholder.com/150x150",
    description: "Specially formulated nutrition for growing kittens.",
    isOnSale: false,
  },
  {
    id: 5,
    name: "Premium Dog Treats",
    brand: "Cesar",
    price: 18,
    originalPrice: 22,
    stock: 12,
    category: "Accessories",
    rating: 4.6,
    reviews: 123,
    image: "https://via.placeholder.com/150x150",
    description: "Delicious treats made with real meat for training and rewards.",
    isOnSale: true,
  },
  {
    id: 6,
    name: "Dry Dog Food",
    brand: "Kibbles",
    price: 55,
    originalPrice: 55,
    stock: 33,
    category: "Food",
    rating: 4.2,
    reviews: 198,
    image: "https://via.placeholder.com/150x150",
    description: "High-quality dry food with essential nutrients for active dogs.",
    isOnSale: false,
  },
  {
    id: 7,
    name: "Cat Toy Mouse",
    brand: "PetPlay",
    price: 12,
    originalPrice: 15,
    stock: 50,
    category: "Toys",
    rating: 4.7,
    reviews: 89,
    image: "https://via.placeholder.com/150x150",
    description: "Interactive toy mouse with catnip to keep your cat entertained.",
    isOnSale: true,
  },
  {
    id: 8,
    name: "Dog Collar",
    brand: "PetGear",
    price: 25,
    originalPrice: 25,
    stock: 20,
    category: "Accessories",
    rating: 4.3,
    reviews: 76,
    image: "https://via.placeholder.com/150x150",
    description: "Adjustable collar with durable buckle and ID tag holder.",
    isOnSale: false,
  },
]

const categories = ["Food", "Accessories", "Toys"]

interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice: number
  stock: number
  category: string
  rating: number
  reviews: number
  image: string
  description: string
  isOnSale: boolean
}

interface CartItem extends Product {
  quantity: number
}

export default function BuyerProductCatalogScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Food")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [showCart, setShowCart] = useState(false)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      Alert.alert("Out of Stock", "This product is currently out of stock.")
      return
    }

    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    Alert.alert("Added to Cart", `${product.name} has been added to your cart.`)
  }

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter((item) => item.id !== productId))
    } else {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#FFA500" />)
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#FFA500" />)
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#FFA500" />)
    }
    return stars
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 shadow-sm">
        {/* Search Bar */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-1 relative">
            <View className="absolute left-3 top-3 z-10">
              <Ionicons name="search" size={16} color="#9CA3AF" />
            </View>
            <TextInput
              placeholder="Search..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              className="bg-gray-100 rounded-full pl-10 pr-4 py-3 text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity className="relative bg-orange-500 p-3 rounded-full" onPress={() => setShowCart(true)}>
            <Ionicons name="bag-outline" size={20} color="white" />
            {cartItemsCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{cartItemsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-6">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`pb-2 ${selectedCategory === category ? "border-b-2 border-orange-500" : ""}`}
              >
                <Text className={`font-medium ${selectedCategory === category ? "text-orange-500" : "text-gray-600"}`}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView className="flex-1 px-4 py-4">
        <View className="flex-row flex-wrap justify-between">
          {filteredProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              className="w-[48%] bg-white rounded-xl p-3 mb-4 shadow-sm"
              onPress={() => {
                setSelectedProduct(product)
                setShowProductDetails(true)
              }}
            >
              {/* Product Image */}
              <View className="relative">
                <Image source={{ uri: product.image }} className="w-full h-32 rounded-lg" resizeMode="cover" />
                {product.isOnSale && (
                  <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">SALE</Text>
                  </View>
                )}
                {product.stock === 0 && (
                  <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
                    <Text className="text-white font-bold">OUT OF STOCK</Text>
                  </View>
                )}
              </View>

              {/* Brand */}
              <View className="flex-row items-center mt-2 mb-1">
                <View className="w-4 h-4 bg-orange-500 rounded-full mr-2" />
                <Text className="text-orange-600 text-xs font-medium">{product.brand}</Text>
              </View>

              {/* Product Name */}
              <Text className="font-semibold text-gray-900 text-sm mb-1" numberOfLines={2}>
                {product.name}
              </Text>

              {/* Rating */}
              <View className="flex-row items-center mb-2">
                <View className="flex-row mr-1">{renderStars(product.rating)}</View>
                <Text className="text-xs text-gray-500">({product.reviews})</Text>
              </View>

              {/* Price */}
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-gray-900">${product.price}</Text>
                  {product.isOnSale && (
                    <Text className="text-xs text-gray-500 line-through">${product.originalPrice}</Text>
                  )}
                </View>
                <TouchableOpacity
                  className={`p-2 rounded-full ${product.stock === 0 ? "bg-gray-300" : "bg-orange-500"}`}
                  onPress={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <Text className="text-lg font-medium text-gray-900 mb-2 mt-4">No products found</Text>
            <Text className="text-gray-600 text-center">Try searching for something else</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-200 px-4 py-2">
        <View className="flex-row justify-around">
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="home" size={24} color="#F97316" />
            <Text className="text-orange-500 text-xs mt-1">Home</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="heart-outline" size={24} color="#9CA3AF" />
            <Text className="text-gray-500 text-xs mt-1">My Pets</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2" onPress={() => setShowCart(true)}>
            <Ionicons name="bag-outline" size={24} color="#9CA3AF" />
            <Text className="text-gray-500 text-xs mt-1">Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center py-2">
            <Ionicons name="person-outline" size={24} color="#9CA3AF" />
            <Text className="text-gray-500 text-xs mt-1">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Details Modal */}
      <Modal visible={showProductDetails} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowProductDetails(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Product Details</Text>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {selectedProduct && (
            <ScrollView className="flex-1">
              <Image source={{ uri: selectedProduct.image }} className="w-full h-64" resizeMode="cover" />

              <View className="p-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-5 h-5 bg-orange-500 rounded-full mr-2" />
                  <Text className="text-orange-600 font-medium">{selectedProduct.brand}</Text>
                  {selectedProduct.isOnSale && (
                    <View className="bg-red-500 px-2 py-1 rounded-full ml-2">
                      <Text className="text-white text-xs font-bold">SALE</Text>
                    </View>
                  )}
                </View>

                <Text className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</Text>

                <View className="flex-row items-center mb-3">
                  <View className="flex-row mr-2">{renderStars(selectedProduct.rating)}</View>
                  <Text className="text-gray-600">({selectedProduct.reviews} reviews)</Text>
                </View>

                <View className="flex-row items-center mb-4">
                  <Text className="text-3xl font-bold text-gray-900">${selectedProduct.price}</Text>
                  {selectedProduct.isOnSale && (
                    <Text className="text-lg text-gray-500 line-through ml-2">${selectedProduct.originalPrice}</Text>
                  )}
                </View>

                <Text className="text-gray-600 mb-4">{selectedProduct.description}</Text>

                <View className="flex-row items-center mb-6">
                  <Ionicons name="cube-outline" size={20} color="#6B7280" />
                  <Text className="text-gray-600 ml-2">
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : "Out of stock"}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}

          <View className="p-4 border-t border-gray-200">
            <TouchableOpacity
              className={`w-full py-4 rounded-xl flex-row items-center justify-center ${
                selectedProduct?.stock === 0 ? "bg-gray-300" : "bg-orange-500"
              }`}
              onPress={() => selectedProduct && addToCart(selectedProduct)}
              disabled={selectedProduct?.stock === 0}
            >
              <Ionicons name="bag-add-outline" size={20} color="white" />
              <Text className="text-white font-bold ml-2 text-lg">
                {selectedProduct?.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Cart Modal */}
      <Modal visible={showCart} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Shopping Cart ({cartItemsCount})</Text>
            <View />
          </View>

          {cart.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="bag-outline" size={64} color="#9CA3AF" />
              <Text className="text-xl font-medium text-gray-900 mt-4 mb-2">Your cart is empty</Text>
              <Text className="text-gray-600 text-center mb-6">Add some products to get started</Text>
              <TouchableOpacity className="bg-orange-500 px-6 py-3 rounded-xl" onPress={() => setShowCart(false)}>
                <Text className="text-white font-bold">Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView className="flex-1 p-4">
                {cart.map((item) => (
                  <View key={item.id} className="flex-row bg-gray-50 rounded-xl p-4 mb-3">
                    <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg" resizeMode="cover" />
                    <View className="flex-1 ml-3">
                      <Text className="text-xs text-orange-600 font-medium">{item.brand}</Text>
                      <Text className="font-semibold text-gray-900 mb-1" numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text className="text-lg font-bold text-gray-900">${item.price}</Text>
                    </View>
                    <View className="items-center">
                      <View className="flex-row items-center bg-white rounded-lg">
                        <TouchableOpacity
                          className="p-2"
                          onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          <Ionicons name="remove" size={16} color="#6B7280" />
                        </TouchableOpacity>
                        <Text className="px-3 font-bold">{item.quantity}</Text>
                        <TouchableOpacity
                          className="p-2"
                          onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          <Ionicons name="add" size={16} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-sm font-bold text-gray-900 mt-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View className="p-4 border-t border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-gray-900">Total</Text>
                  <Text className="text-2xl font-bold text-orange-500">${cartTotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity className="w-full bg-orange-500 py-4 rounded-xl">
                  <Text className="text-white font-bold text-center text-lg">Checkout</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}
