import {getAllPosts , getPostfromSearchQueryandKwarto} from '$db/posts.js'
import { getPost, editPost } from "$db/posts";
import {EJSON} from 'bson'

export const actions = {
    submit: async(event) => {

        if(event.locals.user == null){
            redirect(303, '/login?plsLogIn')
        }

        const data = await event.request.formData()

        const post = {
            parentComment : data.get('replyingTo'),
            postID: event.params.post,
            content: data.get('content'),                
            author: event.locals.user.username,
            votes: 0,
        }

        console.log(post)

        const result = createComment(post)

        if (result) {
            return true
        }

        return false
    },

    editPost: async(event) => {

        if(event.locals.user == null){
            redirect(303, '/login?plsLogIn')
        }

        const data = await event.request.formData()

        console.log('data')
        console.log(data)

        //check if the author of post data is equal to current user.
        console.log('getting post')
        const author = await getPost(data.get('postID'))
        
        console.log('verifying author and user')
        console.log(event.locals.user.username, author.username)
        if(event.locals.user.username !== author.username){
            redirect(303, '/login')
        }

        //check if form is empty
        console.log('checking empty field')
        if(data.get('title') === "" || data.get('content') === ""){
            
            redirect(303, "?emptyContent")
        }


        //check if there are no changes
        if(data.get('title') === author.title && data.get('content') === author.content){
            console.log('no changes')
            return false
        }

        console.log('all forms good')

        const newContent = {
            _id : data.get('postID'),
            title : data.get('title'),
            content : data.get('content')
        }

        const result = await editPost(newContent)
        console.log(result)

        if(result) {
            return true
        }

        return false



    }

}

export const load = async({params, url}) => {

    console.log('this is params')
    console.log(params)

    const searchTerm = params.searchTerm
    console.log("this is search term: " +  searchTerm)

    if(url.searchParams.has('sortBy')){
        let sortBy = url.searchParams.get('sortBy')
        const result = await getPostfromSearchQueryandKwarto(sortBy, searchTerm, params.kwarto)
        const data = {}
        data.posts = result
        data.query = searchTerm
        data.kwarto = params.kwarto

        return EJSON.serialize(data)


    }else{

        const result = await getPostfromSearchQueryandKwarto('new', searchTerm, params.kwarto)
        const data = {}
        data.posts = result
        data.query = searchTerm
        data.kwarto = params.kwarto

        console.log(data)
        console.log(url)
    
        return EJSON.serialize(data)

    }

}