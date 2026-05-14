import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import OptimizedImage from './OptimizedImage';
import { useAddToProductCartMutation } from '../../services/api/productCartApi';
import { showSuccessToast, showErrorToast } from '../../utils/toastConfig';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

const ProductCard = ({ product, compact = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [addToCart, { isLoading }] = useAddToProductCartMutation();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      showSuccessToast(`${product.name} added to cart`);
    } catch (err) {
      showErrorToast(err?.data?.detail || 'Failed to add item to cart');
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      navigate('/product-checkout');
    } catch (err) {
      showErrorToast(err?.data?.detail || 'Failed to add item to cart');
    }
  };

  const imageUrl = product.image_urls?.[0] || '/images/placeholders/product-placeholder.jpg';

  const discountAmount = product.discount_price 
    ? product.price - product.discount_price 
    : 0;
  
  const discountPercent = product.discount_price 
    ? Math.round((discountAmount / product.price) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-col h-full relative">
      {/* B2B Price Badge */}
      {product.is_b2b_price && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-blue-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            B2B PRICE
          </span>
        </div>
      )}
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className={`block relative w-full ${compact ? 'pt-[80%]' : 'pt-[100%]'} bg-white overflow-hidden`}>
        <div className={`absolute ${compact ? 'inset-0.5' : 'inset-2 sm:inset-4'} flex items-center justify-center mix-blend-multiply group-hover:scale-105 transition-transform duration-500`}>
          <OptimizedImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full"
            objectFit="contain"
          />
        </div>
      </Link>

      {/* Content Container */}
      <div className={`${compact ? 'p-1' : 'p-2 sm:p-3'} flex flex-col flex-grow`}>
        {/* Category */}
        <div className={`flex items-center font-medium text-gray-400 mb-0.5 ${compact ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'}`}>
          <span className="uppercase tracking-wider truncate">{product.category}</span>
        </div>

        {/* Title */}
        <Link to={`/products/${product.slug}`} className="block hover:text-accent-orange transition-colors">
          <h3 className={`font-semibold text-gray-800 line-clamp-2 leading-tight mb-0.5 ${compact ? 'text-[8.5px] h-[22px]' : 'text-xs sm:text-sm h-[32px] sm:h-[40px]'}`}>
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          {/* Price Section */}
          <div className={`flex flex-col ${compact ? 'mt-0.5' : 'mt-1 sm:mt-2'}`}>
            <div className="flex items-baseline gap-1">
              {product.discount_price ? (
                <span className={`font-bold text-gray-900 ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}`}>
                  ₹{product.discount_price.toFixed(0)}
                </span>
              ) : (
                <span className={`font-bold text-gray-900 ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}`}>
                  ₹{product.price.toFixed(0)}
                </span>
              )}
              {product.discount_price && !compact && (
                <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                  ₹{product.price.toFixed(0)}
                </span>
              )}
            </div>
            
            {/* Discount info (shown only when NOT compact or if space allows) */}
            {product.discount_price && !compact && (
              <span className="text-accent-orange font-medium text-[9px] sm:text-[10px]">
                {discountPercent}% OFF
              </span>
            )}

            {/* Action Buttons */}
            <div className={`flex items-center gap-1 ${compact ? 'mt-1' : 'mt-2'}`}>
              <button 
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`flex-1 border border-accent-orange text-accent-orange bg-white hover:bg-accent-orange hover:text-white rounded-md font-medium transition-colors flex items-center justify-center shadow-sm whitespace-nowrap ${compact ? 'h-5 text-[8px]' : 'h-7 sm:h-8 text-[10px] sm:text-xs'}`}
              >
                {isLoading ? '...' : 'ADD'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={isLoading}
                className={`flex-1 bg-accent-orange text-white border border-accent-orange hover:bg-opacity-90 rounded-md font-medium transition-colors flex items-center justify-center shadow-sm whitespace-nowrap ${compact ? 'h-5 text-[8px]' : 'h-7 sm:h-8 text-[10px] sm:text-xs'}`}
              >
                BUY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
