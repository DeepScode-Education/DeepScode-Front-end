// src/components/CanonicalTag.tsx
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const CanonicalTag = () => {
    // Get the current path like "/courses" or "/courses/1"
    const location = useLocation();

    // !!! IMPORTANT: Replace this URL with your actual website domain !!!
    const BASE_URL = 'https://slate-academy.com';

    // Combine the base URL with the current pathname to create the full URL
    // Remove the trailing slash if you don't want it in your canonical URL
    const canonicalUrl = `${BASE_URL}${location.pathname}`.replace(/\/+$/, '');

    return (
        <Helmet>
            <link rel="canonical" href={canonicalUrl} />
        </Helmet>
    );
};

export default CanonicalTag;