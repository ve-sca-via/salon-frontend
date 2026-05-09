import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProductBySlugQuery } from '../../../services/api/productApi';
import { useAddToProductCartMutation } from '../../../services/api/productCartApi';
import { showSuccessToast, showErrorToast } from '../../../utils/toastConfig';
import { FiShoppingCart, FiCreditCard, FiChevronLeft, FiStar, FiTruck, FiShield, FiRotateCcw } from 'react-icons/fi';
import Button from '../../../components/shared/Button';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: productData, isLoading, error } = useGetProductBySlugQuery(slug);
  const product = productData?.product || productData;

  // Cart mutation
  const [addToCart, { isLoading: isAddingToCart }] = useAddToProductCartMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gradient-to-r from-accent-orange to-orange-400 rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-neutral-black">Product Not Found</h2>
        <p className="text-neutral-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          <FiChevronLeft className="mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  // Use product images or placeholder
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/800x800?text=No+Image+Available'];

  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  const handleAction = async (actionType) => {
    if (!isAuthenticated) {
      // Redirect to login, but remember where we came from
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      // Add to cart
      await addToCart({
        product_id: product.id,
        quantity: quantity,
      }).unwrap();

      if (actionType === 'add_to_cart') {
        showSuccessToast('Added to cart successfully!');
      } else if (actionType === 'buy_now') {
        navigate('/product-checkout'); // Redirect to product checkout directly
      }
    } catch (err) {
      showErrorToast(err?.data?.detail || 'Failed to add item to cart');
    }
  };

  return (
    <div className="bg-bg-secondary min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb / Back Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-neutral-gray-500 hover:text-accent-orange mb-6 transition-colors"
        >
          <FiChevronLeft className="mr-1" /> Back
        </button>

        <div className="bg-primary-white rounded-2xl shadow-sm p-6 lg:p-10 flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
              <img 
                src={images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-accent-orange' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-2">
              <span className="text-sm font-semibold text-accent-orange uppercase tracking-wider">
                {product.brand || product.category_name || 'Beauty'}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-neutral-black mb-3">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                <FiStar className="fill-current" />
                <FiStar className="fill-current" />
                <FiStar className="fill-current" />
                <FiStar className="fill-current" />
                <FiStar className="fill-current text-gray-300" />
                <span className="text-neutral-gray-500 text-sm ml-2">(4.0)</span>
              </div>
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-semibold">
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-8">
              {product.discount_price ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-neutral-black">
                    ₹{product.discount_price}
                  </span>
                  <span className="text-lg text-neutral-gray-400 line-through">
                    ₹{product.price}
                  </span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    {discountPercentage}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-neutral-black">
                  ₹{product.price}
                </span>
              )}
              <p className="text-xs text-neutral-gray-400 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-neutral-gray-600 leading-relaxed text-sm">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-8 flex items-center gap-4">
              <span className="font-semibold text-neutral-black">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-l-lg transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-semibold min-w-[40px] text-center border-x border-gray-200">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 flex justify-center items-center gap-2 border-2"
                onClick={() => handleAction('add_to_cart')}
                disabled={isAddingToCart || product.stock_quantity === 0}
                loading={isAddingToCart}
              >
                <FiShoppingCart className="text-lg" />
                Add to Cart
              </Button>
              <Button 
                variant="primary" 
                size="lg" 
                className="flex-1 flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30"
                onClick={() => handleAction('buy_now')}
                disabled={isAddingToCart || product.stock_quantity === 0}
              >
                <FiCreditCard className="text-lg" />
                Buy Now
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-accent-orange">
                  <FiTruck />
                </div>
                <span className="text-xs font-medium text-neutral-gray-600">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-accent-orange">
                  <FiRotateCcw />
                </div>
                <span className="text-xs font-medium text-neutral-gray-600">7 Days Return</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-accent-orange">
                  <FiShield />
                </div>
                <span className="text-xs font-medium text-neutral-gray-600">100% Authentic</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
