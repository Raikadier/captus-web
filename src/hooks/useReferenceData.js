import { useState, useEffect } from 'react';
import { referenceDataService } from '../services/referenceDataService';

export const useReferenceData = () => {
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, prioritiesData] = await Promise.all([
                    referenceDataService.getCategories(),
                    referenceDataService.getPriorities()
                ]);
                setCategories(categoriesData);
                setPriorities(prioritiesData);
            } catch (err) {
                console.error('Error fetching reference data:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { categories, priorities, loading, error };
};
