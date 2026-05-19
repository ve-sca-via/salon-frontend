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
    <div
      className="rounded-2xl overflow-hidden flex flex-col h-full relative transition-all duration-500 group"
      style={{
        background: 'linear-gradient(160deg, #fffdf7 0%, #fff8ee 55%, #fff3e0 100%)',
        border: '1.5px solid #f0d9a8',
        boxShadow: '0 2px 10px rgba(248,156,2,0.07)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = '1.5px solid #F89C02';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(248,156,2,0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1.5px solid #f0d9a8';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(248,156,2,0.07)';
      }}
    >
      {/* Orange top accent bar */}
      <div
        className="w-full"
        style={{
          height: compact ? '3px' : '4px',
          background: 'linear-gradient(90deg, #F89C02 0%, #FFB84D 100%)',
        }}
      />

      {/* B2B Price Badge */}
      {product.is_b2b_price && (
        <div className="absolute top-3 right-2 z-10">
          <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            B2B PRICE
          </span>
        </div>
      )}

      {/* Image Container */}
      <Link
        to={`/products/${product.slug}`}
        className={`block relative w-full ${compact ? 'pt-[85%]' : 'pt-[100%]'} overflow-hidden`}
        style={{ background: 'linear-gradient(160deg, #fcecd2 0%, #f8dbb8 100%)' }}
      >
        <div
          className={`absolute ${compact ? 'inset-2' : 'inset-5 sm:inset-7'} flex items-center justify-center mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out`}
        >
          <OptimizedImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full"
            objectFit="contain"
          />
        </div>
      </Link>

      {/* Content Container */}
      <div
        className={`${compact ? 'p-2' : 'p-3 sm:p-4'} flex flex-col flex-grow`}
        style={{ background: 'transparent' }}
      >
        {/* Category */}
        <div className={`flex items-center font-bold mb-1 ${compact ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'}`}
          style={{ color: '#c97d02' }}>
          <span className="uppercase tracking-widest truncate">{product.category}</span>
        </div>

        {/* Title */}
        <Link to={`/products/${product.slug}`} className="block transition-colors duration-300 hover:text-amber-600">
          <h3
            className={`font-display font-bold line-clamp-2 leading-tight mb-1 ${compact ? 'text-[9px] h-[24px]' : 'text-sm sm:text-base h-[36px] sm:h-[48px]'}`}
            style={{ color: '#1a1a1a' }}
          >
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          {/* Price Section */}
          <div className={`flex flex-col ${compact ? 'mt-1' : 'mt-2 sm:mt-3'}`}>
            <div className="flex items-center gap-2">
              {product.discount_price ? (
                <>
                  <span
                    className={`font-bold ${compact ? 'text-[11px]' : 'text-base sm:text-lg'}`}
                    style={{ color: '#F89C02' }}
                  >
                    ₹{product.discount_price.toFixed(0)}
                  </span>
                  <span className={`line-through ${compact ? 'text-[8px]' : 'text-xs sm:text-sm'}`}
                    style={{ color: '#b0a090' }}>
                    ₹{product.price.toFixed(0)}
                  </span>
                </>
              ) : (
                <span
                  className={`font-bold ${compact ? 'text-[11px]' : 'text-base sm:text-lg'}`}
                  style={{ color: '#1a1a1a' }}
                >
                  ₹{product.price.toFixed(0)}
                </span>
              )}
            </div>

            {/* Discount info badge */}
            {product.discount_price && (
              <div className={`mt-0.5 ${compact ? 'hidden' : 'block'}`}>
                <span
                  className="font-bold text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: '#fff3cd', color: '#b35c00' }}
                >
                  SAVE {discountPercent}%
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex items-center gap-1.5 ${compact ? 'mt-1.5' : 'mt-3 sm:mt-4'}`}>
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`flex-1 rounded-lg font-bold transition-all duration-300 flex items-center justify-center whitespace-nowrap ${compact ? 'h-6 text-[8px]' : 'h-8 sm:h-10 text-[10px] sm:text-xs'}`}
                style={{
                  background: '#fff',
                  border: '1.5px solid #F89C02',
                  color: '#F89C02',
                  boxShadow: '0 1px 4px rgba(248,156,2,0.10)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F89C02';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = '#F89C02';
                }}
              >
                {isLoading ? '...' : 'ADD'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isLoading}
                className={`flex-1 rounded-lg font-bold transition-all duration-300 flex items-center justify-center whitespace-nowrap ${compact ? 'h-6 text-[8px]' : 'h-8 sm:h-10 text-[10px] sm:text-xs'}`}
                style={{
                  background: 'linear-gradient(135deg, #F89C02 0%, #FFB84D 100%)',
                  border: '1.5px solid #F89C02',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(248,156,2,0.25)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(248,156,2,0.40)';
                  e.currentTarget.style.filter = 'brightness(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(248,156,2,0.25)';
                  e.currentTarget.style.filter = 'brightness(1)';
                }}
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
