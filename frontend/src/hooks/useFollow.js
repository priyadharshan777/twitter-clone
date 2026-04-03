import { useMutation, useQueryClient } from "@tanstack/react-query"
import { baseUrl } from "../constant/url"
import toast from "react-hot-toast"

const useFollow = () =>{
    const queryClient = useQueryClient()
    const {mutate : follow, isPending} = useMutation({
        mutationFn : async(userId)=>{
            try {
                const res = await fetch(`${baseUrl}/api/users/follow/${userId}`,{
                    method : "POST",
                    credentials : "include",
                    headers : {
                        "Content-Type" : "application/json"
                    }
                })
                const data = await res.json()
                if(!res.ok){
                    throw new Error(data.error || "something went wrong")
                }
                return data
            } catch (error) {
                throw error
            }
        },
        async onSuccess(){
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ["authUser"]}),
                queryClient.invalidateQueries({queryKey: ["suggestedUsers"]})
            ])
        },
        onError(error){
            toast.error(error.message)
        }
    })
    return {follow,isPending}
}

export default useFollow