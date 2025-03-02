variable "bucket_name" {
  type        = string
  description = "The name of the S3 bucket"
}

output "bucket_name" {
  value       = aws_s3_bucket.s3_bucket.bucket
  description = "Same as input variable"
}

variable "domain_name" {
  type        = string
  description = "The domain name for the CloudFront distribution"
}

output "domain_name" {
  value       = aws_cloudfront_distribution.cloudfront_distribution.domain_name
  description = "Same as input variable"
}

variable "route53_zone_id" {
  type        = string
  description = "The Route 53 zone ID"
}

output "route53_zone_id" {
  value       = aws_route53_record.route53_record.zone_id
  description = "Same as input variable"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the S3 bucket"
  default     = {}
}
