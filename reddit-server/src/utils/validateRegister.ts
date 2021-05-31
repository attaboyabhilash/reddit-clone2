import { UsernamePasswordInput } from "./UsernamePasswordInput"

export const validateRegister = (options: UsernamePasswordInput) => {
        if(!options.email.includes('@')) {
            return [{
                    field: 'email',
                    message: 'invalid email'
                }]
        }
        if(options.username.includes('@')) {
            return [{
                    field: 'username',
                    message: 'cannot include "@" in username'
                }]
        }
        if(options.username.length <= 3) {
            return [{
                    field: 'username',
                    message: 'username must be greater than 3 characters'
                }]
        }
        if(options.password.length <= 3) {
            return [{
                    field: 'password',
                    message: 'password must be greater than 3 characters'
                }]
        }
        return null
}