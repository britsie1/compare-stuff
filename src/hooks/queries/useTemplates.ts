import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { 
    getTemplate, 
    getTemplates, 
    getUserTemplates, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
    getTemplateItems,
    addTemplateItem,
    updateTemplateItem,
    deleteTemplateItem,
    setTemplateStatus,
    Template,
    TemplateItem
} from '../../services/templates';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface PaginatedTemplates {
    templates: Template[];
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}

export const useTemplates = (pageSize: number = 10, lastVisible: QueryDocumentSnapshot<DocumentData> | null = null): UseQueryResult<PaginatedTemplates, Error> => {
    return useQuery({
        queryKey: ['templates', pageSize, lastVisible],
        queryFn: () => getTemplates(pageSize, lastVisible),
    });
};

export const useTemplate = (id: string, userId: string | null = null): UseQueryResult<Template, Error> => {
    return useQuery({
        queryKey: ['template', id, userId],
        queryFn: () => getTemplate(id, userId),
        enabled: !!id,
    });
};

export const useUserTemplates = (userId: string | undefined): UseQueryResult<Template[], Error> => {
    return useQuery({
        queryKey: ['userTemplates', userId],
        queryFn: () => getUserTemplates(userId!),
        enabled: !!userId,
    });
};

export const useTemplateItems = (templateId: string): UseQueryResult<TemplateItem[], Error> => {
    return useQuery({
        queryKey: ['templateItems', templateId],
        queryFn: () => getTemplateItems(templateId),
        enabled: !!templateId,
    });
};

export const useCreateTemplateMutation = (): UseMutationResult<Template, Error, { templateData: Partial<Template>, user: any }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ templateData, user }) => createTemplate(templateData, user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            queryClient.invalidateQueries({ queryKey: ['userTemplates'] });
        },
    });
};

export const useUpdateTemplateMutation = (): UseMutationResult<void, Error, { templateId: string, updatedData: Partial<Template> }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ templateId, updatedData }) => updateTemplate(templateId, updatedData),
        onSuccess: (_, { templateId }) => {
            queryClient.invalidateQueries({ queryKey: ['template', templateId] });
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            queryClient.invalidateQueries({ queryKey: ['userTemplates'] });
        },
    });
};

export const useDeleteTemplateMutation = (): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (templateId: string) => deleteTemplate(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            queryClient.invalidateQueries({ queryKey: ['userTemplates'] });
        },
    });
};

export const useAddItemMutation = (templateId: string): UseMutationResult<string, Error, Partial<TemplateItem>> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemData: Partial<TemplateItem>) => addTemplateItem(templateId, itemData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templateItems', templateId] });
        },
    });
};

export const useUpdateItemMutation = (templateId: string): UseMutationResult<boolean, Error, { itemId: string, itemData: Partial<TemplateItem> }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, itemData }) => updateTemplateItem(templateId, itemId, itemData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templateItems', templateId] });
        },
    });
};

export const useDeleteItemMutation = (templateId: string): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemId: string) => deleteTemplateItem(templateId, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templateItems', templateId] });
        },
    });
};

export const useSetTemplateStatusMutation = (userId: string | undefined): UseMutationResult<void, Error, { templateId: string, newStatus: 'unpublished' | 'private' | 'published' }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ templateId, newStatus }) => setTemplateStatus(templateId, newStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userTemplates', userId] });
            queryClient.invalidateQueries({ queryKey: ['templates'] });
        },
    });
};
