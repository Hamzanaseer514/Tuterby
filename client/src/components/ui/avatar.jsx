
export const Avatar = ({ children, className }) => (
    <div className={`rounded-full overflow-hidden ${className}`}>
      {children}
    </div>
  );
  
  export const AvatarImage = ({ src, alt, className }) => (
    <img src={src} alt={alt} className={`w-full h-full object-cover ${className}`} />
  );
  
  export const AvatarFallback = ({ children, className }) => (
    <div className={`bg-gray-100 flex items-center justify-center w-full h-full ${className}`}>
      {children}
    </div>
  );