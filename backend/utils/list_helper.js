const initialBlogs = [
        {
            title: "First blog",
            author: "Antonio",
            url: "url",
            likes: 3
        },
        {
            title: "Second blog",
            author: "Ricardo",
            url: "url",
            likes: 5
        }
    ]

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let result = 0
    blogs.forEach(blog => {
        result += blog.likes
    })

    return result
}

const favoriteBlog = (blogs) => {
    if(blogs.length === 0) return null
    return blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max)
}

module.exports = {
    initialBlogs,
    dummy,
    totalLikes,
    favoriteBlog
}