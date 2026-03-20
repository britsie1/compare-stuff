import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { getComments, addComment, addReply, updateComment } from '../../services/comments';

export const useComments = (templateId: string): UseQueryResult<any[], Error> => {
    return useQuery({
        queryKey: ['comments', templateId],
        queryFn: () => getComments(templateId),
        initialData: [],
    });
};

export const useAddCommentMutation = (templateId: string): UseMutationResult<any, Error, any> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentData) => addComment(templateId, commentData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', templateId] });
        },
    });
};

export const useAddReplyMutation = (templateId: string): UseMutationResult<any, Error, { parentId: string, replyData: any }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ parentId, replyData }) => addReply(templateId, parentId, replyData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', templateId] });
        },
    });
};

export const useUpdateCommentMutation = (templateId: string): UseMutationResult<any, Error, { commentId: string, updates: any }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId, updates }) => updateComment(templateId, commentId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', templateId] });
        },
    });
};
