import axiosInstance from "../utils/axiosInstance"

export const createShortUrl = async (url, customAlias, expiresIn) =>{
    const {data} = await axiosInstance.post("/api/create",{url, customAlias, expiresIn})
    return data.shortUrl
}
export const getAnalytics = async (id) => {
    const {data} = await axiosInstance.get(`/api/analytics/${id}`)
    return data;
}
