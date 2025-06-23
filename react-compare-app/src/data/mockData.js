export const initialData = [
    {
        id: 1,
        title: 'Medical Aid Schemes 2024',
        description: 'A detailed comparison of popular medical aid schemes in South Africa for young professionals.',
        imageUrl: 'https://placehold.co/600x300/6366f1/ffffff?text=Medical+Aids',
        templateFields: ['Scheme Name', 'Plan Name', 'Monthly Premium', 'Day-to-day Cover', 'Hospital Cover'],
        items: [
            { id: 101, title: 'Discovery Classic Smart', values: ['Discovery', 'Classic Smart', 'R2,500', 'R15,000', 'Unlimited'] },
            { id: 102, title: 'Bonitas BonStart', values: ['Bonitas', 'BonStart', 'R1,800', 'R10,000', 'R1 Million'] },
            { id: 103, title: 'Momentum Ingwe', values: ['Momentum', 'Ingwe', 'R950', 'R5,000', 'Network Hospitals'] },
        ],
        favorites: 128,
        lastUpdated: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    {
        id: 2,
        title: 'Smartphones under R10k',
        description: 'Finding the best value-for-money smartphone without breaking the bank. Focus on camera and battery.',
        imageUrl: 'https://placehold.co/600x300/ec4899/ffffff?text=Smartphones',
        templateFields: ['Brand', 'Model', 'Price', 'Screen Size', 'Camera MP', 'Battery Life (hrs)'],
        items: [
             { id: 201, title: 'Samsung Galaxy A54', values: ['Samsung', 'Galaxy A54', 'R8,999', '6.4"', '50MP', '48'] },
             { id: 202, title: 'Xiaomi Redmi Note 12 Pro', values: ['Xiaomi', 'Redmi Note 12 Pro', 'R7,499', '6.67"', '108MP', '40'] },
             { id: 203, title: 'Apple iPhone SE (2022)', values: ['Apple', 'iPhone SE (2022)', 'R9,999', '4.7"', '12MP', '36'] },
        ],
        favorites: 345,
        lastUpdated: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    }
];