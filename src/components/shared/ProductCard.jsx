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

  const imageUrl = product.image_urls?.[0] || '/images/placeholders/product-placeholder.jpg';

  const discountAmount = product.discount_price 
    ? product.price - product.discount_price 
    : 0;
  
  const discountPercent = product.discount_price 
    ? Math.round((discountAmount / product.price) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-col h-full relative">
      {/* Image Container */}
      <Link to={`/products/${product.slug}`} className="block relative w-full pt-[100%] bg-white overflow-hidden">
        <div className="absolute inset-2 sm:inset-4 flex items-center justify-center mix-blend-multiply group-hover:scale-105 transition-transform duration-500">
          <OptimizedImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full"
            objectFit="contain"
          />
        </div>
      </Link>

      {/* Content Container */}
      <div className={`${compact ? 'p-1.5' : 'p-2 sm:p-3'} flex flex-col flex-grow`}>
        {/* Category & Time (Blinkit style meta) */}
        <div className={`flex items-center font-medium text-gray-500 mb-0.5 sm:mb-1 ${compact ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'}`}>
          <span className="uppercase tracking-wider truncate">{product.category}</span>
        </div>

        {/* Title */}
        <Link to={`/products/${product.slug}`} className="block group-hover:text-brand-primary transition-colors">
          <h3 className={`font-semibold text-gray-800 line-clamp-2 leading-tight mb-1 sm:mb-2 ${compact ? 'text-[10px] h-[28px]' : 'text-xs sm:text-sm h-[32px] sm:h-[40px]'}`}>
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          {/* Price and Add to Cart Section */}
          <div className="flex flex-col mt-1 sm:mt-2">
            <div className="flex flex-row items-center justify-between gap-1 sm:gap-0">
              <div className="flex flex-col">
                {product.discount_price ? (
                  <span className={`font-bold text-gray-900 ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}`}>
                    ₹{product.discount_price.toFixed(2)}
                  </span>
                ) : (
                  <span className={`font-bold text-gray-900 ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}`}>
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`px-2 sm:px-4 w-auto border border-brand-primary text-brand-primary bg-brand-primary/5 hover:bg-brand-primary hover:text-white rounded-md font-medium transition-colors flex items-center justify-center shadow-sm whitespace-nowrap ${compact ? 'h-6 text-[9px]' : 'h-7 sm:h-8 text-[10px] sm:text-xs sm:rounded-lg'}`}
              >
                {isLoading ? '...' : 'ADD'}
              </button>
            </div>
            
            {/* Discount info below */}
            {product.discount_price && (
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-gray-400 line-through ${compact ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'}`}>
                  MRP ₹{product.price.toFixed(2)}
                </span>
                <span className={`text-brand-primary font-medium ${compact ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'}`}>
                  ({discountPercent}% OFF)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
