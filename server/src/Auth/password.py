import hashlib
import os

def hash_password(password: str) -> (str, bytes): # type: ignore
    """Hash a password with a salt."""
    # Generate a random salt
    salt = os.urandom(16)
    
    # Use the hashlib library to hash the password together with the salt
    # We're using sha256 in this example, but you can use other algorithms as well
    pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    
    # Return the hexadecimal representation of the hash along with the salt
    return pwdhash.hex(), salt

def verify_password(stored_password_hash: str, salt: bytes, provided_password: str) -> bool:
    """Verify a provided password against the stored hash and salt."""
    # Hash the provided password with the stored salt
    pwdhash = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
    
    # Compare the hash of the provided password with the stored hash
    return pwdhash.hex() == stored_password_hash

# # Example usage
# password = "my_super_secret_password"
# hashed_password, salt = hash_password(password)

# print(f"Hashed Password: {hashed_password}")
# print(f"Salt: {salt.hex()}")

# # Verifying the password
# is_correct = verify_password(hashed_password, salt, "my_super_secret_password")
# print(f"Password correct: {is_correct}")
