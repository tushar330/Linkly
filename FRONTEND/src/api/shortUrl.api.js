import axiosInstance from "../utils/axiosInstance"

export const createShortUrl = async (originalUrl, customAlias, expiresIn) =>{
    const {data} = await axiosInstance.post("/api/urls/create",{originalUrl, customAlias, expiresIn})
    return data.shortUrl
}
export const getAnalytics = async (id) => {
    const {data} = await axiosInstance.get(`/api/analytics/${id}`)
    return data;
}
